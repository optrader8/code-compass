declare module 'tree-sitter' {
  export interface SyntaxNode {
    childForFieldName(name: string): SyntaxNode | null;
    namedChildren: SyntaxNode[];
    parent: SyntaxNode | null;
    text: string;
    type: string;
    startPosition: { row: number; column: number };
    endPosition: { row: number; column: number };
  }
  export default class Parser {
    parse(input: string): { rootNode: SyntaxNode };
    setLanguage(lang: any): void;
  }
}
declare module 'tree-sitter-javascript';
declare module 'tree-sitter-typescript';
declare module 'tree-sitter-python';

// React and ink type declarations
declare module 'react' {
  import { ComponentType, ReactNode, ReactElement, useState, useEffect, useCallback } from 'react';

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export const FC: FunctionComponent;
  export const useState: typeof useState;
  export const useEffect: typeof useEffect;
  export const useCallback: typeof useCallback;
}

declare module 'ink' {
  import { ComponentType, ReactNode, ReactElement } from 'react';

  export interface BoxProps {
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    padding?: number;
    paddingX?: number;
    paddingY?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    margin?: number;
    marginX?: number;
    marginY?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
    borderColor?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
    height?: number;
    width?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    children?: ReactNode;
  }

  export interface TextProps {
    color?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
    backgroundColor?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    dim?: boolean;
    inverse?: boolean;
    wrap?: 'wrap' | 'truncate' | 'ignore' | 'wrap-start' | 'wrap-end' | 'truncate-start' | 'truncate-end' | 'middle';
    children?: ReactNode;
  }

  export interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    focus?: boolean;
    showCursor?: boolean;
    mask?: string;
  }

  export const Box: ComponentType<BoxProps>;
  export const Text: ComponentType<TextProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export function useInput(callback: (input: string, key: any) => void): void;
  export function useApp(): { exit: () => void };
  export function render<T>(element: ReactElement<T>): void;
  export function createElement<T>(type: ComponentType<T>, props?: T, ...children: ReactNode[]): ReactElement<T>;
}
