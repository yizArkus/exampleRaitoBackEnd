import type { Request, Response } from 'express';
import { getHealth } from '../../../src/controllers/healthController';

describe('getHealth', () => {
  it('responde 200 con cuerpo esperado', () => {
    const req = {} as Request;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status, json } as unknown as Response;

    getHealth(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        service: 'rait-backend',
      })
    );
  });
});
