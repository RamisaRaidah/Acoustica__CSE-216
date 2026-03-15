import { useState, useRef } from "react";
import { createAlbum } from "@/services/music_service/albums";

export function CreateAlbum() {
    const formRef = useRef<HTMLFormElement>(null);
    const [creating, setCreating] = useState<boolean>(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if(!formRef.current) return;

        const formData = new FormData(formRef.current);

        try {
            setCreating(true);
            const response = await createAlbum(formData);
            if (response) {
                alert("The album is created successfully!");
            }
        }
        catch(error) {
            alert("Failed to create the album!");
        }
        finally {
            setCreating(false);
            formRef.current.reset();
        }
    }

    return (
        <div id="create-album-container">
            <form ref={formRef} id="create-album-form" encType="multipart/form-data" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Album Title</label>
                    <input
                        type="text"
                        name="album_title"
                        placeholder="Enter album title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                        type="text"
                        name="description"
                    />
                </div>

                <div className="form-group">
                    <label>Release Date</label>
                    <input
                        type="date"
                        name="release_date"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Cover Picture</label>
                    <input
                        type="file"
                        name="cover_picture"
                        accept=".jpg, .png, .jpeg"
                    />
                </div>

                <div className="form-group">
                    <label>Copyright Certificate (PDF)</label>
                    <input
                        type="file"
                        name="copyright_certificate"
                        accept=".pdf"
                        required
                    />
                </div>

                <button type="submit">Upload</button>
            </form>
        </div>
    )
}