import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

type LetterProof = {
  signature: string;
  seal: string;
};

const oldLetter = { signature: 'Orven', seal: 'split-star' };
export const wizardLetter = {
  ...oldLetter,
  message: 'My friends, please help whoever brings you this letter. They have my trust.',
};

export const antidoteRequest = '“Our friend was hit by a poisoned arrow. Can you give us the antidote?”';

export type Phase = 'request' | 'check-letter' | 'verify-letter' | 'verified' | 'forward' | 'answer' | 'relay' | 'refuse' | 'helped' | 'denied';

type Stage = {
  phase: Phase;
  call: string;
  message: string;
};

export function simulateRequest(graph: LessonGraph, letter: LetterProof | null): readonly Stage[] | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }

  const route: Stage[] = [
    {
      phase: 'request',
      call: 'contact.requestHelp(request)',
      message: letter
        ? 'Narion hands over Orven’s letter and asks for the antidote.'
        : 'Narion asks for the antidote. He forgets the letter in his coat.',
    },
    {
      phase: 'check-letter',
      call: 'canPass(request)',
      message: letter
        ? 'The guard takes the letter and goes inside to check it.'
        : 'The guard asks if anyone he knows can vouch for the party.',
    },
  ];

  if (letter)
  {
    route.push({
      phase: 'verify-letter',
      call: 'canPass(request)',
      message: 'Inside the den, the guard compares the signature and wax seal with an old letter from Orven.',
    });
  }

  if (!letter || letter.signature !== oldLetter.signature || letter.seal !== oldLetter.seal)
  {
    return [...route,
      {
        phase: 'refuse',
        call: 'return refusal',
        message: letter
          ? 'The signature or seal doesn’t match. The guard turns Narion away.'
          : '“I can’t take you to the Elder without a word from someone we trust,” says the guard.',
      },
      {
        phase: 'denied',
        call: 'return refusal',
        message: letter
          ? 'The guard can’t verify the letter, so the Elder never hears the request.'
          : 'The guard refuses and the Elder never hears the request. Narion suddenly remembers the letter in his coat.',
      },
    ];
  }

  return [...route,
    {
      phase: 'verified',
      call: 'canPass(request)',
      message: 'The signature and seal match. Orven is an old friend of the Tish-Karr.',
    },
    {
      phase: 'forward',
      call: 'elder.requestHelp(request)',
      message: 'Now that he knows the letter is real, the guard takes Narion’s request to the Elder.',
    },
    {
      phase: 'answer',
      call: 'return reply',
      message: 'The Elder gives the guard the antidote to take back to Narion.',
    },
    {
      phase: 'relay',
      call: 'return reply',
      message: 'The guard brings the antidote back to Narion.',
    },
    {
      phase: 'helped',
      call: 'return reply',
      message: 'Narion has the antidote for his wounded friend.',
    },
  ];
}
