import { renderHook } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act } from 'react-dom/test-utils';
import useFetch from '../useFetch';

const url = 'https://api.uomg.com/api/qq.info';
const server = setupServer(
  rest.get(url, (req, res, ctx) => {
    return res(ctx.json({ greeting: 'hello there' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('QQSearch', () => {
  describe('useFetch', () => {
    it('请求错误', async () => {
      server.use(
        rest.get(url, (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      const { result } = renderHook(() => useFetch());

      await act(() => result.current.fetchData('12341234'));

      expect(result.current.error).toBe('请求错误');
    });

    it('查询失败，请重试！', async () => {
      server.use(
        rest.get(url, (req, res, ctx) => {
          return res(ctx.json({ code: 201702, msg: '查询失败，请重试！' }));
        })
      );

      const { result } = renderHook(() => useFetch());

      await act(() => result.current.fetchData('12341234'));

      expect(result.current.error).toBe('查询失败，请重试！');
    });

    it('查询成功', async () => {
      const data = { code: 1, name: 'test', qlogo: 'qlogo' };
      server.use(
        rest.get(url, (req, res, ctx) => {
          return res(ctx.json(data));
        })
      );

      const { result } = renderHook(() => useFetch());
      await act(() => result.current.fetchData('1241324'));
      expect(result.current.data).toEqual(data);
    });
  });
});
