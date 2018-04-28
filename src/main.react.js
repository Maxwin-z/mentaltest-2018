// React
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Counter from './Counter.jsx'

class App extends Component {
  render() {
    return (
      <div>
        Mental React Example
        <Counter count={0} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root-react'))
