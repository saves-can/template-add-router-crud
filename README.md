# api-users

## Development

To run this api in development mode run:

```
deno task dev
```

## Test

To run the test for this api run:

```
deno task test
```

### Test in development mode

To run the test for this api in development mode run:

```
deno task test:dev
```

## Preview

To preview this api run:

```
deno task preview
```

## Deploy

To deploy this api to `test` run:

```
deno task deploy:test
```

### Deploy to prod

To deploy this api to `prod` run:

```
deno task deploy:prod
```

## Release

To release a new `patch` version push to main. To any type of release go to the
repo under actions publish release select.

To skip a release add `[skip]` to the commit message

## Usage

To use the api in any deno script

```ts
import { api } "https://raw.githubusercontent.com/clau-org/api-<NAME>/v0.0.1/src/api.ts"
```
