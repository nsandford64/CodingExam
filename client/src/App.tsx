import React from "react"
import { Button, Intent } from "@blueprintjs/core"
import styled from "styled-components"

const StyledApp = styled.div`
	
`

function App() {
	return (
		<StyledApp>
			<Button intent={Intent.PRIMARY} text="Hello World!" />
		</StyledApp>
	)
}

export default App
