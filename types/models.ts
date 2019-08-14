export type ComparerStr<T> = (a: T, b: T) => string
export type ComparerNum<T> = (a: T, b: T) => number

export type Comparer<T> = ComparerNum<T> | ComparerStr<T>

export type IdSelectorStr<T> = (model: T) => string
export type IdSelectorNum<T> = (model: T) => number

export type IdSelector<T> = IdSelectorStr<T> | IdSelectorNum<T>

export interface DictionaryNum<T> {
    [id: number]: T | undefined
}

export abstract class Dictionary<T> implements DictionaryNum<T> {
    [id: string]: T | undefined
}

export interface UpdateStr<T> {
    id: string
    changes: Partial<T>
}

export interface UpdateNum<T> {
    id: number
    changes: Partial<T>
}

export type Update<T> = UpdateStr<T> | UpdateNum<T>

export type Predicate<T> = (entity: T) => boolean

export type EntityMap<T> = (entity: T) => T

export interface EntityState<T> {
    ids: string[] | number[]
    entities: Dictionary<T>
}

export interface EntityDefinition<T> {
    selectId: IdSelector<T>
    sortComparer: false | Comparer<T>
}

export interface EntityStateAdapter<T> {
    addOne<S extends EntityState<T>>(entity: T, state: S): S
    addMany<S extends EntityState<T>>(entities: T[], state: S): S
    addAll<S extends EntityState<T>>(entities: T[], state: S): S

    removeOne<S extends EntityState<T>>(key: string, state: S): S
    removeOne<S extends EntityState<T>>(key: number, state: S): S

    removeMany<S extends EntityState<T>>(keys: string[], state: S): S
    removeMany<S extends EntityState<T>>(keys: number[], state: S): S
    removeMany<S extends EntityState<T>>(predicate: Predicate<T>, state: S): S

    removeAll<S extends EntityState<T>>(state: S): S

    updateOne<S extends EntityState<T>>(update: Update<T>, state: S): S
    updateMany<S extends EntityState<T>>(updates: Update<T>[], state: S): S

    upsertOne<S extends EntityState<T>>(entity: T, state: S): S
    upsertMany<S extends EntityState<T>>(entities: T[], state: S): S

    map<S extends EntityState<T>>(map: EntityMap<T>, state: S): S
}

export interface EntitySelectors<T, V> {
    selectIds: (state: V) => string[] | number[]
    selectEntities: (state: V) => Dictionary<T>
    selectAll: (state: V) => T[]
    selectTotal: (state: V) => number
}

export interface EntityAdapter<T> extends EntityStateAdapter<T> {
    selectId: IdSelector<T>
    sortComparer: false | Comparer<T>
    getInitialState(): EntityState<T>
    getInitialState<S extends object>(state: S): EntityState<T> & S
    getSelectors(): EntitySelectors<T, EntityState<T>>
    getSelectors<V>(
        selectState: (state: V) => EntityState<T>
    ): EntitySelectors<T, V>
}

export interface Action {
    type: string
}

// declare to make it property-renaming safe
export declare interface TypedAction<T extends string> extends Action {
    readonly type: T
}

export type ActionType<A> = A extends ActionCreator<infer T, infer C>
    ? ReturnType<C> & { type: T }
    : never

export type TypeId<T> = () => T

export type InitialState<T> = Partial<T> | TypeId<Partial<T>> | void

/**
 * A function that takes an `Action` and a `State`, and returns a `State`.
 * See `createReducer`.
 */
export interface ActionReducer<T, V extends Action = Action> {
    (state: T | undefined, action: V): T
}

export type ActionReducerMap<T, V extends Action = Action> = {
    [p in keyof T]: ActionReducer<T[p], V>
}

export interface ActionReducerFactory<T, V extends Action = Action> {
    (
        reducerMap: ActionReducerMap<T, V>,
        initialState?: InitialState<T>
    ): ActionReducer<T, V>
}

export type MetaReducer<T = any, V extends Action = Action> = (
    reducer: ActionReducer<T, V>
) => ActionReducer<T, V>

export interface StoreFeature<T, V extends Action = Action> {
    key: string
    reducers: ActionReducerMap<T, V> | ActionReducer<T, V>
    reducerFactory: ActionReducerFactory<T, V>
    initialState?: InitialState<T>
    metaReducers?: MetaReducer<T, V>[]
}

export type Selector<T, V> = (state: T) => V

export type SelectorWithProps<State, Props, Result> = (
    state: State,
    props: Props
) => Result

export type DisallowTypeProperty<T> = T extends { type: any }
    ? TypePropertyIsNotAllowed
    : T

export const typePropertyIsNotAllowedMsg =
    "type property is not allowed in action creators"
type TypePropertyIsNotAllowed = typeof typePropertyIsNotAllowedMsg

/**
 * A function that returns an object in the shape of the `Action` interface.  Configured using `createAction`.
 */
export type Creator<
    P extends any[] = any[],
    R extends object = object
> = R extends { type: any }
    ? TypePropertyIsNotAllowed
    : FunctionWithParametersType<P, R>

export type PropsReturnType<T extends object> = T extends { type: any }
    ? TypePropertyIsNotAllowed
    : { _as: "props"; _p: T }

/**
 * See `Creator`.
 */
export type ActionCreator<
    T extends string = string,
    C extends Creator = Creator
> = C & TypedAction<T>

export type FunctionWithParametersType<P extends unknown[], R = void> = (
    ...args: P
) => R

export type ParametersType<T> = T extends (...args: infer U) => unknown
    ? U
    : never

export interface RuntimeChecks {
    strictStateSerializability: boolean
    strictActionSerializability: boolean
    strictStateImmutability: boolean
    strictActionImmutability: boolean
}
