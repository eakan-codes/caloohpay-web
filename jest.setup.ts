import '@testing-library/jest-dom';

// Polyfill for Next.js API routes
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Minimal Request polyfill for Jest
if (!global.Request) {
  global.Request = class Request {
    constructor(
      public url: string,
      public init?: RequestInit
    ) {}
  } as unknown as typeof Request;
}

// Minimal Response polyfill for Jest
if (!global.Response) {
  global.Response = class Response {
    constructor(
      public body?: BodyInit | null,
      public init?: ResponseInit
    ) {}
    async json() {
      return JSON.parse(this.body as string);
    }
    async text() {
      return this.body as string;
    }
    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }
  } as unknown as typeof Response;
}
