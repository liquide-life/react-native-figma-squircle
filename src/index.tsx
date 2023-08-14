import * as React from 'react'
import { ViewProps, View, StyleSheet } from 'react-native'
import { PropsWithChildren, ReactNode, useState } from 'react'
import Svg, { ClipPath, Color, Defs, Path, LinearGradient, Stop } from 'react-native-svg'
import { getSvgPath } from 'figma-squircle'
import { useId } from "@reach/auto-id";

interface SquircleParams {
  cornerRadius?: number
  topLeftCornerRadius?: number
  topRightCornerRadius?: number
  bottomRightCornerRadius?: number
  bottomLeftCornerRadius?: number
  cornerSmoothing: number
  fillColor?: Color
  fillGradientColors?: Color[]
  strokeColor?: Color
  strokeGradientColors?: Color[]
  strokeWidth?: number
}

interface SquircleViewProps extends ViewProps {
  squircleParams: SquircleParams
}

function SquircleView({
  squircleParams,
  children,
  ...rest
}: PropsWithChildren<SquircleViewProps>) {
  return (
    <View {...rest}>
      <SquircleBackground {...squircleParams} />
      {children}
    </View>
  )
}

function SquircleBackground({
  cornerRadius = 0,
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  cornerSmoothing,
  fillColor = '#000',
  strokeColor = '#000',
  strokeWidth = 0,
  fillGradientColors,
  strokeGradientColors,
}: SquircleParams) {
  const squircleId = useId()

  return (
    <Rect style={StyleSheet.absoluteFill}>
      {({ width, height }) => {
        const squirclePath = getSvgPath({
          width,
          height,
          cornerSmoothing,
          cornerRadius,
          topLeftCornerRadius,
          topRightCornerRadius,
          bottomRightCornerRadius,
          bottomLeftCornerRadius,
        })

        const hasStroke = strokeWidth > 0

        if (!hasStroke) {
          return (
            <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
              <Path d={squirclePath} fill={fillColor} />
            </Svg>
          )
        } else {
          // Since SVG doesn't support inner stroke, we double the stroke width
          // and remove the outer half with clipPath
          const clipPathId = `clip-${squircleId}`

          return (
            <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
              <Defs>
                <ClipPath id={clipPathId}>
                  <Path d={squirclePath} />
                </ClipPath>
              </Defs>
              {
                strokeGradientColors?.length ?
                  <Defs>
                    <LinearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      {strokeGradientColors.map((color, index) => (
                        <Stop key={index} offset={`${(index / (strokeGradientColors.length - 1)) * 100}%`} stopColor={color} />
                      ))}
                    </LinearGradient>
                  </Defs>
                  : null
              }

              {
                fillGradientColors?.length ?
                  <Defs>
                    <LinearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      {fillGradientColors?.map((color, index) => (
                        <Stop key={index} offset={`${(index / (fillGradientColors.length - 1)) * 100}%`} stopColor={color} />
                      ))}
                    </LinearGradient>
                  </Defs>
                  : null
              }

              <Path
                clipPath={`url(#${clipPathId})`}
                d={squirclePath}
                fill={fillGradientColors?.length ? "url(#fillGradient)" : fillColor}
                stroke={strokeGradientColors?.length ? "url(#strokeGradient)": strokeColor}
                strokeWidth={strokeWidth * 2}
              />
            </Svg>
          )
        }
      }}
    </Rect>
  )
}

// Inspired by https://reach.tech/rect/
interface RectProps extends ViewProps {
  children: (rect: { width: number; height: number }) => ReactNode
}

function Rect({ children, ...rest }: RectProps) {
  const [rect, setRect] =
    useState<{ width: number; height: number } | null>(null)

  return (
    <View
      {...rest}
      onLayout={(e) => {
        setRect({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }}
    >
      {rect ? children(rect) : null}
    </View>
  )
}

export { SquircleView, getSvgPath }
export type { SquircleParams, SquircleViewProps }
