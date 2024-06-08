import { VError } from '@lvce-editor/verror'
import { join } from 'node:path'
import * as rollup from 'rollup'

const getExternal = (babelExternal, initialExternal) => {
  const external = [...initialExternal]
  if (babelExternal) {
    external.push(/babel-parser\.js$/)
  }
  return external
}

/**
 *
 * @param {{from:string,cwd:string, exclude?:string[], platform:'node'|'webworker'|'web'|'node/cjs', minify?:boolean, codeSplitting?:boolean, babelExternal?:boolean, typescript?:boolean, outFile:string
 * allowCyclicDependencies?:boolean, external?:string[] }} param0
 */
export const bundleJs = async ({
  cwd,
  from,
  codeSplitting = false,
  babelExternal = false,
  external = [],
  typescript = from.endsWith('.ts'),
  outFile,
}) => {
  try {
    const allExternal = getExternal(babelExternal, external)
    const plugins = []
    const { nodeResolve } = await import('@rollup/plugin-node-resolve')
    plugins.push(
      nodeResolve({
        preferBuiltins: true,
      }),
    )
    if (typescript) {
      const { babel } = await import('@rollup/plugin-babel')
      const { default: pluginTypeScript } = await import('@babel/preset-typescript')
      plugins.push(
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          presets: [pluginTypeScript],
        }),
      )
    }
    /**
     * @type {import('rollup').RollupOptions}
     */
    const inputOptions = {
      cache: false,
      input: join(cwd, from),
      preserveEntrySignatures: 'strict',
      treeshake: {
        propertyReadSideEffects: false,

        // moduleSideEffects: false,
      },
      perf: true,
      external: allExternal,
      plugins,
    }
    const result = await rollup.rollup(inputOptions)
    if (result.getTimings) {
      const timings = result.getTimings()
      console.log({ timings })
    }
    /**
     * @type {import('rollup').ModuleFormat}
     */
    let outputFormat = 'es'

    /**
     * @type {import('rollup').OutputOptions}
     */
    const outputOptions = {
      paths: {},
      sourcemap: false,
      format: outputFormat,
      extend: false,
      file: outFile,
      entryFileNames: 'renderer-process.modern.js',
      exports: 'auto',
      freeze: false,
      inlineDynamicImports: !codeSplitting,
      minifyInternalExports: false,
      generatedCode: {
        constBindings: true,
        objectShorthand: true,
      },
      hoistTransitiveImports: false,
    }
    await result.write(outputOptions)
  } catch (error) {
    throw new VError(error, `Failed to bundle js`)
  }
}
