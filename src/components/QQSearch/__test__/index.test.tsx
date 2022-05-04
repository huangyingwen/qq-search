import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act } from 'react-dom/test-utils';
import QQSearch from '..';

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
  it('输入不合法', async () => {
    render(<QQSearch />);

    const input = await screen.findByPlaceholderText('请输入 QQ 号');
    fireEvent.input(input, {
      target: { value: '4' },
    });

    await waitFor(() => {
      expect(screen.getByText('QQ 号格式不正确')).toBeInTheDocument();
    });

    fireEvent.input(input, {
      target: { value: '423a' },
    });

    await waitFor(() => {
      expect(screen.getByText('QQ 号格式不正确')).toBeInTheDocument();
    });

    fireEvent.input(input, {
      target: { value: 'aaaaaa' },
    });

    await waitFor(() => {
      expect(screen.getByText('QQ 号格式不正确')).toBeInTheDocument();
    });
  });

  it('请求错误', async () => {
    server.use(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<QQSearch />);

    const input = await screen.findByPlaceholderText('请输入 QQ 号');
    fireEvent.input(input, {
      target: { value: '4234234' },
    });

    await waitFor(() => {
      expect(screen.getByText('请求错误')).toBeInTheDocument();
    });
  });

  it('查询失败，请重试！', async () => {
    server.use(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.json({ code: 201702, msg: '查询失败，请重试！' }));
      })
    );
    render(<QQSearch />);

    const input = await screen.findByPlaceholderText('请输入 QQ 号');
    fireEvent.input(input, {
      target: { value: '234827487' },
    });

    await waitFor(() => {
      expect(screen.getByText('查询失败，请重试！')).toBeInTheDocument();
    });
  });

  it('请求正确', async () => {
    const data = { code: 1, name: 'test', qlogo: 'qlogo' };
    server.use(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.json(data));
      })
    );

    render(<QQSearch />);

    const input = await screen.findByPlaceholderText('请输入 QQ 号');
    fireEvent.input(input, {
      target: { value: '234827487' },
    });

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
