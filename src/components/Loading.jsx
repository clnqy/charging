import React from 'react'

const Loading = ({ size = 40 }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div 
        className="border-4 border-gray-200 border-t-primary rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  )
}

export default Loading
