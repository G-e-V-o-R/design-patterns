import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

type LetterProof = {
  signature: string;
  seal: string;
};

export const oldLetter = { signature: 'Orven', seal: 'split-star' };
export const wizardLetter = {
  ...oldLetter,
  message: 'Please help the bearer. They have my trust.',
  messageRu: 'Пожалуйста, помогите тому, кто принесёт это письмо. Этому человеку я доверяю.',
};

export const antidoteRequest = '“Our friend was poisoned. We need an antidote.”';
export const antidoteRequestRu = '«Нашего друга отравили. Нам нужно противоядие».';

export type Phase = 'request' | 'check-letter' | 'verify-letter' | 'verified' | 'forward' | 'answer' | 'relay' | 'refuse' | 'helped' | 'denied';

type Stage = {
  phase: Phase;
  call: string;
  message: string;
  messageRu: string;
};

export function getMessageDuration(message: string): number
{
  const wordCount = message.match(/\S+/g)?.length ?? 0;
  // Минимум даёт анимации маршрута закончиться даже с короткой репликой.
  return Math.max(1200, 650 + wordCount * 220);
}

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
        ? 'Narion asks for the antidote and shows Orven’s letter.'
        : 'Narion asks for the antidote.',
      messageRu: letter
        ? 'Нарион просит противоядие и показывает письмо Орвена.'
        : 'Нарион просит противоядие.',
    },
    {
      phase: 'check-letter',
      call: 'canPass(request)',
      message: letter
        ? 'The guard takes the letter inside.'
        : '“Who can vouch for you?” asks the guard.',
      messageRu: letter
        ? 'Страж уносит письмо внутрь.'
        : '«Кто может за тебя поручиться?» — спрашивает страж.',
    },
  ];

  if (letter)
  {
    route.push({
      phase: 'verify-letter',
      call: 'canPass(request)',
      message: 'Checking signature and wax seal…',
      messageRu: 'Страж сверяет подпись и сургучную печать…',
    });
  }

  if (!letter || letter.signature !== oldLetter.signature || letter.seal !== oldLetter.seal)
  {
    return [...route,
      {
        phase: 'refuse',
        call: 'return refusal',
        message: letter
          ? '“The signature or seal doesn’t match.”'
          : '“I need someone to vouch for you.”',
        messageRu: letter
          ? '«Подпись или печать не совпадает».'
          : '«За тебя должен кто-то поручиться».',
      },
      {
        phase: 'denied',
        call: 'return refusal',
        message: letter
          ? 'The letter fails verification. The Elder never hears the request.'
          : 'The Elder never hears the request. Narion remembers the letter.',
        messageRu: letter
          ? 'Письмо не проходит проверку. Старейшина так и не узнаёт о просьбе.'
          : 'Старейшина так и не узнаёт о просьбе. Нарион вспоминает о письме.',
      },
    ];
  }

  return [...route,
    {
      phase: 'verified',
      call: 'canPass(request)',
      message: 'Signature and seal match.',
      messageRu: 'Подпись и печать совпадают.',
    },
    {
      phase: 'forward',
      call: 'elder.requestHelp(request)',
      message: 'The guard asks the Elder for help.',
      messageRu: 'Страж обращается за помощью к Старейшине.',
    },
    {
      phase: 'answer',
      call: 'return reply',
      message: 'The Elder gives the guard the antidote.',
      messageRu: 'Старейшина даёт стражу противоядие.',
    },
    {
      phase: 'relay',
      call: 'return reply',
      message: 'The guard hands the antidote to Narion.',
      messageRu: 'Страж передаёт противоядие Нариону.',
    },
    {
      phase: 'helped',
      call: 'return reply',
      message: 'Narion has the antidote.',
      messageRu: 'Противоядие у Нариона.',
    },
  ];
}
