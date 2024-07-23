type SuspensablePromiseState<T> =
  | {
      status: "pending";
      promise: Promise<T> | undefined;
    }
  | {
      status: "resolved";
      value: T;
    }
  | {
      status: "rejected";
      error: unknown;
    };

/**
 * Given a promise, creates a function that can be used in any component to suspend the component until the promise
 * is resolved. The promise will be executed once and its result will be cached.
 *
 * This is useful for React 18 where we do not have access to `use` to suspend promises.
 *
 * Note that the [same caveats for `use` apply](https://react.dev/blog/2024/04/25/react-19#new-feature-use), namely,
 * you should pass a promise from a suspense-powered library or framework that supports caching for promises.
 * Alternatively
 *
 * **WARNING:** Note that, unlike in React's example, we will not give warnings/errors if you use a non-memoized
 * promise.
 *
 * It will return:
 *
 * - `use`: A function that will throw the promise if it is pending (so the component suspens), the error if it is
 *   rejected (so the component throws), or the value if it is resolved.
 *
 *   E.g.:
 *
 *   ```jsx
 *   const someGlobalPromise = suspendablePromise(fetch("https://example.com"));
 *
 *   const Foo = () => {
 *     const promiseValue = someGlobalPromise.use();
 *
 *     return <pre>{JSON.stringify(promiseValue, null, 2)}</pre>;
 *   }
 *   ```
 *
 * - `reset`: A function that will reset the promise to a new one, while clearing the old promise's cached result. This
 *   is useful for when you want to invalidate the promise's value cache and re-execute the promise.
 */
export const suspendablePromise = <T>(promise?: Promise<T> | undefined) => {
  let state: SuspensablePromiseState<T>;

  const use = () => {
    switch (state.status) {
      case "pending":
        throw state.promise;
      case "rejected":
        throw state.error;
      case "resolved":
        return state.value;
    }
    // @ts-expect-error This should never happen
    throw new Error(`Unexpected status: ${state.status}`);
  };

  const reset = (newPromise?: Promise<T> | undefined) => {
    state = {
      status: "pending" as const,
      promise: newPromise,
    };

    newPromise?.then(
      (value) => {
        // Ignore since it was superseded
        if (state.status !== "pending" || state.promise !== newPromise) {
          return;
        }

        state = {
          status: "resolved" as const,
          value,
        };
      },
      (error) => {
        // Ignore since it was superseded
        if (state.status !== "pending" || state.promise !== newPromise) {
          return;
        }

        state = {
          status: "rejected" as const,
          error,
        };
      },
    );
  };

  reset(promise);

  return {
    use,
    reset,
  };
};

/**
 * A convenience function that wraps `suspendablePromise` in a way that you can pass a function that returns a promise
 * instead of a promise directly.
 *
 * This way you just have to specify the promise maker function once and it will be executed automatically for you, as
 * well as reset when needed.
 *
 * See the `suspendablePromise` docs for usage and caveats.
 */
export const suspendablePromiseMaker = <T>(
  promiseMaker: () => Promise<T>,
  {
    lazy = false,
  }: {
    /**
     * Whether a new promise will be immediately executed, or only when the `use` or `reset` function are called for the
     * first time.
     */
    lazy?: boolean;
  } = {},
) => {
  const inner = suspendablePromise(lazy ? undefined : promiseMaker());

  let initialized = !lazy;

  const use = () => {
    if (lazy && !initialized) {
      initialized = true;
      reset();
    }

    return inner.use();
  };

  const reset = () => {
    initialized = true;
    inner.reset(promiseMaker());
  };

  return {
    use,
    reset,
  };
};
