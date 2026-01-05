<div align="center">
  <img src="./media/header_ai.png" >
</div>

<br />

<div align="center">
<a href="https://npmjs.com/package/@tanstack/ai" target="\_parent">
  <img alt="" src="https://img.shields.io/npm/dm/@tanstack/ai.svg" />
</a>
<a href="https://github.com/TanStack/ai" target="\_parent">
	  <img alt="" src="https://img.shields.io/github/stars/TanStack/ai.svg?style=social&label=Star" alt="GitHub stars" />
</a>
<a href="https://bundlephobia.com/result?p=@tanstack/ai@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/@tanstack/ai@latest" />
</a>
</div>

<div align="center">
<a href="#badge">
  <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
</a>
	<a href="#badge">
		<img src="https://img.shields.io/github/v/release/tanstack/ai" alt="Release"/>
	</a>
<a href="https://twitter.com/tan_stack">
  <img src="https://img.shields.io/twitter/follow/tan_stack.svg?style=social" alt="Follow @TanStack"/>
</a>
</div>

<div align="center">
  
### [Become a Sponsor!](https://github.com/sponsors/tannerlinsley/)
</div>

# TanStack Preact AI Devtools

Developer tools for TanStack AI in Preact applications.

## Installation

```bash
npm install @tanstack/preact-ai-devtools
# or
pnpm add @tanstack/preact-ai-devtools
# or
yarn add @tanstack/preact-ai-devtools
```

## Usage

### Using the Panel Component

Add the `AiDevtoolsPanel` component to your app:

```tsx
import { AiDevtoolsPanel } from '@tanstack/preact-ai-devtools'

function App() {
  return (
    <>
      <YourApp />
      <AiDevtoolsPanel />
    </>
  )
}
```

### Using the Plugin

You can also use the devtools as a plugin:

```tsx
import { aiDevtoolsPlugin } from '@tanstack/preact-ai-devtools'
import { useAIProvider } from '@tanstack/ai-preact'

function App() {
  const ai = useAIProvider({
    // your config
    plugins: [aiDevtoolsPlugin()],
  })

  return <YourApp />
}
```

## Production Builds

For production builds, import from the production entry point to exclude devtools code:

```tsx
import { AiDevtoolsPanel } from '@tanstack/preact-ai-devtools/production'
```

The devtools will automatically be disabled in production environments when using the main entry point.

## Get Involved

- [Join the Discord](https://tlinz.com/discord)
- [Read the docs](https://tanstack.com/ai)
- [Report an issue](https://github.com/TanStack/ai/issues)
