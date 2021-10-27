import Header from "./Header";
import Footer from "./Footer";

export default function Layout(props: any) {
    return (
        <div>
            {/* <Header /> */}
            {props.children}
            {/* <Footer /> */}
        </div>
    )
}