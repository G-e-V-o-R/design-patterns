import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const scenariosRoot = resolve('src/scenarios');
const sharedRoot = join(scenariosRoot, 'shared');
const docsRoot = resolve('docs');
const modules = readdirSync(scenariosRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'shared')
    .map(entry => entry.name)
    .sort();
assert.ok(!modules.includes('shared'), 'shared resources must not be registered as a scenario');

function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}

function isInside(parent, target) {
    const path = relative(parent, target);
    return path === '' || (!path.startsWith('..') && !path.startsWith(sep) && !/^[A-Za-z]:/.test(path));
}

for (const module of modules) {
    const moduleRoot = join(scenariosRoot, module);
    const moduleFiles = files(moduleRoot).filter(file => /\.(ts|tsx)$/.test(file));
    const configured = existsSync(join(moduleRoot, 'scenario.json'));
    if (!configured) assert.ok(moduleFiles.some(file => file.endsWith('model.test.ts')), `${module} must own a model.test.ts`);
    for (const file of moduleFiles) {
        const imports = ts.preProcessFile(readFileSync(file, 'utf8'), true, true).importedFiles.map(item => item.fileName);
        for (const specifier of imports) {
            if (!specifier.startsWith('.')) {
                assert.ok(!specifier.startsWith('@/') && !specifier.startsWith('src/'), `Use explicit relative imports in ${file}`);
                continue;
            }
            const target = resolve(dirname(file), specifier.replace(/[?#].*$/, ''));
            assert.ok(
                isInside(moduleRoot, target) || isInside(sharedRoot, target) || isInside(docsRoot, target),
                `${file} imports outside its scenario or shared resources: ${specifier}`,
            );
        }
    }
}

for (const file of files(sharedRoot).filter(file => /\.(ts|tsx)$/.test(file))) {
    const imports = ts.preProcessFile(readFileSync(file, 'utf8'), true, true).importedFiles.map(item => item.fileName);
    for (const specifier of imports) {
        if (!specifier.startsWith('.')) {
            assert.ok(!specifier.startsWith('@/') && !specifier.startsWith('src/'), `Use explicit relative imports in ${file}`);
            continue;
        }
        const target = resolve(dirname(file), specifier.replace(/[?#].*$/, ''));
        assert.ok(
            isInside(sharedRoot, target) || isInside(docsRoot, target),
            `${file} imports scenario-specific or application code: ${specifier}`,
        );
    }
}

const registryFile = join(scenariosRoot, 'registry.ts');
const registry = ts.createSourceFile('registry.ts', readFileSync(registryFile, 'utf8'), ts.ScriptTarget.Latest, true);
const componentImports = new Map();
let scenarioArray;

function unwrap(node) {
    while (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) node = node.expression;
    return node;
}

function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.importClause?.name)
        componentImports.set(node.importClause.name.text, node.moduleSpecifier.text);
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'legacyScenarios' && node.initializer)
        scenarioArray = unwrap(node.initializer);
    ts.forEachChild(node, visit);
}
visit(registry);

assert.ok(scenarioArray && ts.isArrayLiteralExpression(scenarioArray), 'registry must declare a scenarios array');
const entries = scenarioArray.elements.map(element => {
    assert.ok(ts.isObjectLiteralExpression(element), 'every scenario entry must be an object');
    const properties = new Map(element.properties.filter(ts.isPropertyAssignment).map(property => [property.name.getText(registry), property.initializer]));
    const id = properties.get('id');
    const Component = properties.get('Component');
    assert.ok(id && ts.isStringLiteral(id), 'every scenario entry needs a string id');
    assert.ok(Component && ts.isIdentifier(Component), `scenario ${id.text} needs a Component import`);
    return { id: id.text, Component: Component.text };
});

const configuredModules = modules.filter(module => existsSync(join(scenariosRoot, module, 'scenario.json')));
const legacyModules = modules.filter(module => !configuredModules.includes(module));
const ids = entries.map(entry => entry.id);
assert.equal(ids.length, legacyModules.length, 'Register every scenario exactly once');
assert.equal(new Set(ids).size, ids.length, 'Scenario IDs must be unique');
for (const entry of entries) {
    assert.ok(modules.includes(entry.id), `No scenario directory named ${entry.id}`);
    const specifier = componentImports.get(entry.Component);
    assert.ok(specifier, `Missing import for ${entry.Component}`);
    assert.ok(specifier.startsWith(`./${entry.id}/`), `${entry.id} must import its component from ./${entry.id}/`);
}
for (const module of legacyModules)
    assert.ok(ids.includes(module), `Scenario directory ${module} is not registered`);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const module of legacyModules) {
    const script = pkg.scripts[`test:${module}`];
    const testPath = `src/scenarios/${module}/model.test.ts`;
    assert.ok(typeof script === 'string', `Add a test:${module} script to package.json`);
    assert.ok(script.includes(testPath), `test:${module} must run ${testPath}`);
    assert.ok(pkg.scripts.test.includes(`test:${module}`), `npm test must include test:${module}`);
    assert.ok(existsSync(resolve(testPath)), `Missing ${testPath}`);
}

assert.ok(pkg.scripts.test.includes('test:configs'), 'npm test must validate all config-only scenarios');
assert.ok(readFileSync(registryFile, 'utf8').includes("import.meta.glob('./*/scenario.json'"), 'Discover config-only scenarios automatically');
for (const module of configuredModules) {
    const config = JSON.parse(readFileSync(join(scenariosRoot, module, 'scenario.json'), 'utf8'));
    assert.equal(config.id, module, 'Config ID must match its directory');
    assert.ok(!ids.includes(module), 'Do not register a config-only scenario twice');
}

console.log('Scenario module boundaries, registry, and test wiring checks passed.');
