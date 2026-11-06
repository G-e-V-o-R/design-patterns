# Pattern Workshop

The active app is one Observer learning scenario: the fox’s discovery. Players add class/interface cards, assign method cards, connect class relationships, check the diagram, and follow a discovery trace. The two companion classes represent an extensible subscriber family.

`app/App.tsx` keeps lesson progress in memory for the current visit only. Every page load starts with an empty diagram; previous browser saves are ignored and new progress is not saved. `app/components/ObserverLesson.tsx` provides the card tray, React Flow diagram, keyboard-accessible assignment/relationship controls, hints, and worked solution. `application/observer-lesson.ts` defines cards, validates designs, produces the trace, and parses saved diagrams.

Previous story, map, journal, chapter content, and story save modules remain as inactive reference code. Their saves are not loaded or overwritten by this lesson.

Run `npm run dev`, `npm run build`, and `npm test` with Node 22.12 or newer.
