import { createTenv } from '@e2e/tenv';

const { compose, serve } = createTenv(__dirname);

it('should compose the appropriate schema', async () => {
  const { result } = await compose();
  expect(result).toMatchSnapshot();
});

it.concurrent.each([
  {
    name: 'MovieWithActedIn',
    query: /* GraphQL */ `
      query MovieWithActedIn {
        movies(options: { limit: 2 }) {
          title
          released
          tagline
          peopleActedIn(options: { limit: 2 }) {
            name
          }
        }
      }
    `,
  },
])('should execute $name', async ({ query }) => {
  const { target } = await compose({ target: 'graphql' });
  const { execute } = await serve({ fusiongraph: target });
  await expect(execute({ query })).resolves.toMatchSnapshot();
});
