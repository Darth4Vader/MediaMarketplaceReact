import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import App from "../App";
import LoginPage from "../LoginPage";
import LoadMoviePage from "../components/MoviePage";
import LoadCartPage from "../components/CartPage";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
            <ComponentPreview path="/LoginPage">
                <LoginPage/>
            </ComponentPreview>
            <ComponentPreview path="/LoadMoviePage">
                <LoadMoviePage/>
            </ComponentPreview>
            <ComponentPreview path="/LoadCartPage">
                <LoadCartPage/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews