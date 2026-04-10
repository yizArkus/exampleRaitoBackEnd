import type { Request, Response } from 'express';
import { getHealth } from '../../../src/controllers/healthController';

describe('getHealth', () => {
  it('returns 200 with standard success envelope', () => {
    const req = {} as Request;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status, json } as unknown as Response;

    getHealth(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          status: 'ok',
          service: 'rait-backend',
        }),
      })
    );
  });
});
