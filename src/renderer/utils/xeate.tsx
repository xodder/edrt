import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _omit from 'lodash/omit';
import _pullAt from 'lodash/pullAt';
import _set from 'lodash/set';
import React from 'react';
import useRerender from './use-rerender';

interface Xeate<T = any> {
  initial: T;
  current: T;
  changes: Partial<T>;
  changed: (() => boolean) | ((key: string) => boolean);
  reInitWith: (values: T) => void;
  run: (pluginNames: string | string[]) => Promise<any>;
  debouncedRun: (pluginNames: string | string[]) => void;
  get: (key: string, initial?: boolean) => any;
  set: (key: string, value: any) => void;
  setMulti: (values: Record<string, any>) => void;
  debouncedSet: (key: string, value: any) => void;
  debouncedSetMulti: (values: Record<string, any>) => void;
  remove: (key: string) => void;
  watch: (key: string, watcher: Watcher) => () => void;
  unwatch: (key: string, watcher: Watcher) => void;
  clearChanges: () => void;
}

export type XeatePlugin<T> = (
  values: T,
  state: Xeate<T>
) => Promise<T & Record<string, any>>;

type XeatePlugins<T> = Record<string, XeatePlugin<T>>;

type Watcher =
  | ((value: any) => void)
  | {
      key: string;
      callback: (value: any) => void;
    };

class XeateImp<T extends Record<string, unknown>> implements Xeate<T> {
  initial: T;
  current: T;
  changes: Partial<T>;

  private __plugins: Record<string, XeatePlugin<T>>;
  private __timeouts: Record<string, any>;
  private __watchers: Record<string, Watcher[]>;

  constructor(initialValues: T, plugins: XeatePlugins<T>) {
    this.initial = { ...initialValues };
    this.current = { ...initialValues };
    this.changes = {};
    this.__plugins = plugins;
    this.__timeouts = {};
    this.__watchers = {};
  }

  // will be replaced
  changed(key?: string) {
    return this.__changed__(key);
  }

  // listens
  __changed__(key?: string) {
    if (key) {
      return !_isEqual(_get(this.current, key), _get(this.initial, key));
    }

    return !_isEqual(this.current, this.initial);
  }

  reInitWith(values: T) {
    this.initial = values;
    this.changes = {};
    this.current = values;
    this.notify();
    return this.current;
  }

  async run(pluginNames: string | string[]) {
    const plugins = this.__resolvePlugins(pluginNames);

    for (const plugin of plugins) {
      this.current = await plugin(this.current, this);
    }

    this.notify();
  }

  private __resolvePlugins(names: string | string[]) {
    const names__ = typeof names === 'string' ? [names] : names;
    const plugins = names__.map((name) => this.__plugins[name]);

    plugins.forEach((plugin, index) => {
      if (!plugin || typeof plugin !== 'function') {
        throw new Error(`pageStatePlugin: '${names__[index]}' is not defined`);
      }
    });

    return plugins;
  }

  debouncedRun(pluginNames: string | string[]) {
    const key = 'run-' + pluginNames.toString();
    const debouncedFn = this.debounce(key, this.run.bind(this));
    debouncedFn(pluginNames);
  }

  // listens
  get(key: string, initial?: boolean) {
    return this.__get__(key, initial);
  }

  __get__(key: string, initial?: boolean) {
    if (key === '.') {
      return initial ? this.initial : this.current;
    }

    return _get(initial ? this.initial : this.current, key);
  }

  set(key: string, value: unknown) {
    const value__ =
      typeof value === 'function' ? value(_get(this.current, key)) : value;

    const hasChanged = !_isEqual(value__, _get(this.initial, key));

    this.changes = hasChanged
      ? _set(this.changes, key, value__)
      : (_omit(this.changes, key) as any);

    this.current = _set(this.current, key, value__);

    // notify watchers in the tree
    this.notify(key);
  }

  setMulti(values: Record<string, unknown>) {
    const keys = Object.keys(values);

    let result = { ...this.current };

    keys.forEach((key) => {
      const value = values[key];
      const value__ =
        typeof value === 'function' ? value(_get(this.current, key)) : value;

      const hasChanged = !_isEqual(value__, _get(this.initial, key));

      this.changes = hasChanged
        ? _set(this.changes, key, value__)
        : (_omit(this.changes, key) as any);

      result = _set(result, key, value__);
    });

    this.current = result;

    // notify watchers in the tree
    this.notify(keys);
  }

  debouncedSet(key: string, value: any) {
    const fnId = 'set-' + key;
    const debouncedFn = this.debounce(fnId, this.set.bind(this), 300);
    debouncedFn(key, value);
  }

  debouncedSetMulti(values: Record<string, any>) {
    const fnId = 'setMulti-' + Object.keys(values).toString();
    const debouncedFn = this.debounce(fnId, this.setMulti.bind(this), 300);
    debouncedFn(values);
  }

  // TODO: rethink this
  remove(key: string) {
    const lastDotIndex = key.lastIndexOf('.');
    const lastPart = key.substring(lastDotIndex + 1);
    const parentKey = key.substring(0, lastDotIndex);
    const isArrayElement =
      lastPart &&
      lastPart.match(/^\d+$/) && // is last part numeric?
      Array.isArray(_get(this.current, parentKey)); // is parent an array?

    if (isArrayElement) {
      _pullAt(_get(this.current, parentKey) as unknown[], Number(lastPart));
    } else {
      this.current = { ..._omit(this.current, key) } as T;
    }

    // TODO: update changes

    // notify watchers in the tree
    this.notify(key);
  }

  clearChanges() {
    this.changes = {};
    // notify all watchers
    this.notify();
  }

  notify(keys?: string | string[]) {
    if (!keys) {
      setTimeout(() => {
        Object.keys(this.__watchers).forEach((branch) => {
          this.__watchers[branch].forEach((watcher) =>
            typeof watcher === 'function'
              ? watcher(this.__get__(branch))
              : watcher.callback(this.__get__(branch))
          );
        });
      });
      return;
    }

    const keys__ = typeof keys === 'string' ? [keys] : keys;

    for (const key of keys__) {
      const branches = Object.keys(this.__watchers).filter((branch) =>
        this.isBranch(key, branch)
      );

      branches.forEach((branch) => {
        this.__watchers[branch].forEach((watcher) =>
          typeof watcher === 'function'
            ? watcher(this.__get__(branch))
            : watcher.callback(this.__get__(branch))
        );
      });
    }
  }

  isBranch(source: string, candidate: string) {
    return (
      source === candidate ||
      candidate.startsWith(source) ||
      source.startsWith(candidate) ||
      candidate === '.'
    );
  }

  watch(key: string, watcher: Watcher) {
    if (!this.__watchers[key]) {
      this.__watchers[key] = [];
    }

    const watchers = this.__watchers[key];
    const index = this.getWatcherIndex(watcher, watchers);

    if (index === -1) {
      watchers.push(watcher);
    } else {
      watchers[index] = watcher;
    }

    return () => this.unwatch(key, watcher);
  }

  unwatch(key: string, watcher: Watcher) {
    if (!this.__watchers[key]) {
      return;
    }

    const watchers = this.__watchers[key];
    const index = this.getWatcherIndex(watcher, watchers);

    if (index !== -1) {
      watchers.splice(index, 1);
    }
  }

  private getWatcherIndex(watcher: Watcher, stack: Watcher[]) {
    return typeof watcher === 'function'
      ? stack.indexOf(watcher)
      : stack.findIndex((x) => typeof x === 'object' && x.key === watcher.key);
  }

  private debounce(name: string, fn: (...args: any[]) => unknown, wait = 300) {
    return (...args: any[]) => {
      if (this.__timeouts[name]) {
        clearTimeout(this.__timeouts[name]);
      }

      this.__timeouts[name] = setTimeout(() => {
        fn.call(this, ...args);
      }, wait);
    };
  }
}

type XeateProviderProps<T> = React.PropsWithChildren<{
  plugins?: XeatePlugins<T>;
  initialValues: T;
}>;

export type XeateProvider<T> = React.FC<XeateProviderProps<T>>;
export type UseXeate<T> = () => Xeate<T>;
export type MakeXeateResult<T> = [XeateProvider<T>, UseXeate<T>];

export function makeXeate<
  T extends Record<string, unknown>
>(): MakeXeateResult<T> {
  const context = React.createContext<Xeate<T> | undefined>(undefined);
  return [makeXeateProvider(context), makeUseXeate(context)];
}

function makeXeateProvider<T extends Record<string, unknown>>(
  context: React.Context<Xeate<T> | undefined>
) {
  return function XeateProvider({
    children,
    plugins,
    initialValues,
  }: XeateProviderProps<T>) {
    const xeate = useNewXeateInstance<T>(initialValues, plugins);
    return <context.Provider value={xeate}>{children}</context.Provider>;
  };
}

function useNewXeateInstance<T extends Record<string, unknown>>(
  initialValues: T,
  plugins?: XeatePlugins<T>
) {
  const [xeate] = React.useState(
    () => new XeateImp<T>(initialValues, plugins || {})
  );

  xeate.get = MakeUseXeateGetFn(xeate);
  xeate.changed = MakeUseXeateChangedFn(xeate);

  return xeate;
}

function MakeUseXeateGetFn<T extends Record<string, unknown>>(
  xeate: XeateImp<T>
) {
  return React.useCallback(
    function useGetValue(key: string, initial?: boolean) {
      useWatchBranch(xeate, key);
      return xeate.__get__(key, initial);
    },
    [xeate]
  );
}

function MakeUseXeateChangedFn<T extends Record<string, unknown>>(
  xeate: XeateImp<T>
) {
  return React.useCallback(
    function useKeyChanged(key?: string) {
      useWatchBranch(xeate, key);
      return xeate.__changed__(key);
    },
    [xeate]
  );
}

function useWatchBranch<T extends Record<string, unknown>>(
  xeate: XeateImp<T>,
  key?: string
) {
  const rerender = useRerender();

  React.useEffect(() => {
    return xeate.watch(key || '.', rerender);
  }, [key, xeate, rerender]);
}

function makeUseXeate<T>(context: React.Context<Xeate<T> | undefined>) {
  return function useXeate(): Xeate<T> {
    const context__ = React.useContext(context);
    if (!context__) {
      throw new Error('useXeate must be used within a XeateProvider');
    }
    return context__;
  };
}
