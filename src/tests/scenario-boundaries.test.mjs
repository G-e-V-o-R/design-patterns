import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { solutionLesson as observerSolution, validateLesson as validateObserver } from '../scenarios/observer/model.ts';
import { solutionLesson as mediatorSolution, validateLesson as validateMediator } from '../scenarios/mediator/model.ts';
const root = resolve('src/scenarios');
const modules = readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
for (const module of modules) {
    for (const file of files(join(root, module)).filter(file => /\.(ts|tsx)$/.test(file))) {
        const text = readFileSync(file, 'utf8');
        const imports = ts.preProcessFile(text).importedFiles.map(item => item.fileName);
        for (const specifier of imports) {
            if (!specifier.startsWith('.')) {
                assert.ok(!specifier.startsWith('@/') && !specifier.startsWith('src/'), `Use explicit relative imports in ${file}`);
                continue;
            }
            const target = resolve(dirname(file), specifier);
            const owner = relative(root, target).split('/')[0];
            assert.ok(!modules.includes(owner) || owner === module, `${file} imports sibling scenario ${specifier}`);
            assert.ok(!target.startsWith(resolve('src/application')) && !target.startsWith(resolve('src/app')), `${file} reaches into application internals: ${specifier}`);
        }
    }
}
// Read the registry without loading JSX, CSS, or browser-only modules in Node.
const registry = ts.createSourceFile('registry.ts', readFileSync(join(root, 'registry.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
const ids = [];
function visit(node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(registry) === 'id' && ts.isStringLiteral(node.initializer))
        ids.push(node.initializer.text);
    ts.forEachChild(node, visit);
}
visit(registry);
assert.equal(ids.length, modules.length, 'Register every scenario once');
assert.equal(new Set(ids).size, ids.length, 'Scenario IDs must be unique');
for (const id of ids)
    assert.ok(modules.includes(id), `No owned module for ${id}`);
const observer = observerSolution();
const mediator = mediatorSolution();
const observerSnapshot = JSON.stringify(observer);
mediator.classes.pop();
mediator.members['notify-routing'] = 'narion';
mediator.edges[0].target = 'narion';
assert.equal(JSON.stringify(observer), observerSnapshot, 'Editing Mediator must not mutate Observer');
assert.deepEqual(validateObserver(observer), []);
assert.deepEqual(validateMediator(mediatorSolution()), [], 'Fresh Mediator state must not share mutable objects');
const mediatorSnapshot = JSON.stringify(mediator);
observer.classes.pop();
observer.members.notify = 'narion';
observer.edges[0].target = 'narion';
assert.equal(JSON.stringify(mediator), mediatorSnapshot, 'Editing Observer must not mutate Mediator');
assert.deepEqual(validateObserver(observerSolution()), [], 'Fresh Observer state must not share mutable objects');
console.log('Scenario module boundaries and registry checks passed.');
