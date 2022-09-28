import { useNavigate } from "react-router-dom";


export function NewPictureScreen() {
    const navigate = useNavigate();
    const go = (url: string) => {
        navigate(url);
    };

    return (
        <div className="NewPictureScreen">
            <p><button onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; go("/pictures");}}>Pictures</button></p>
            <p><button onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; go("/new-picture");}}>New Picture</button></p>
        </div>
    );
}
