import React from "react"
import "./Title.css"
const Title = ({ children, height }) => {
  return <div style={{height: height}} className="Title">{children.toUpperCase()}</div>
}

export default Title
