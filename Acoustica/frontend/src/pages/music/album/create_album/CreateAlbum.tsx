import "@/pages/music/album/create_album/CreateAlbum.css"
import { useState, useRef } from "react";
import { createAlbum } from "@/services/music_service/albums";
import { DatePicker, DatePickerHandle } from "@/components/date_picker/DatePicker";
import { Alert } from "@/components/alert/Alert";

export function CreateAlbum() {
    const formRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<DatePickerHandle>(null);
    const [creating, setCreating] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();

        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
        const placeholder = document.getElementById("cover-placeholder");
        if (imgEl) { imgEl.src = ""; imgEl.style.display = "none"; }
        if (placeholder) placeholder.style.display = "flex";

        const certName = document.getElementById("cert-name");
        if (certName) certName.textContent = "No file chosen";
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if(!formRef.current) return;

        const formData = new FormData(formRef.current);

        try {
            setCreating(true);
            const response = await createAlbum(formData);
            if (response) {
                setAlertMessage("The album is created successfully!");
            }
        }
        catch(error) {
            setAlertMessage("Failed to create the album!");
        }
        finally {
            setCreating(false);
            resetForm();
        }
    }

    return (
        <div id="create-album-container">
            {alertMessage && <Alert message={alertMessage} />}

            <div id="create-album-header">
                <h1>Create Album</h1>
            </div>

            <form ref={formRef} id="create-album-form" encType="multipart/form-data" onSubmit={handleSubmit} autoComplete="off">

                <div id="create-album-form-left">
                    <div className="form-group">
                        <label>Album Title<span style={{ color: "red" }}>*</span></label>
                        <input
                            type="text"
                            name="album_title"
                            placeholder="Enter album title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Release Date<span style={{ color: "red" }}>*</span></label>
                        <DatePicker ref={datePickerRef} name="release_date" required />
                    </div>

                    <div className="form-group">
                        <label>Copyright Certificate<span style={{ color: "red" }}>*</span></label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">Choose File</span>
                            <span className="file-name" id="cert-name">No file chosen</span>
                            <input
                                type="file"
                                name="copyright_certificate"
                                accept=".pdf"
                                required
                                onChange={e => {
                                    const el = document.getElementById("cert-name");
                                    if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div id="create-album-form-right">
                    <div className="form-group">
                        <label>Cover Picture</label>
                        <div id="cover-picture" onClick={() => document.getElementById("cover-input")?.click()}>
                            <img id="cover-preview" src="" alt="Cover preview" />
                            <div id="cover-placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span>Add Cover</span>
                            </div>
                            <input
                                id="cover-input"
                                type="file"
                                name="cover_picture"
                                accept=".jpg, .png, .jpeg"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
                                    const placeholder = document.getElementById("cover-placeholder");

                                    if (imgEl && file) {
                                        imgEl.src = URL.createObjectURL(file);
                                        imgEl.style.display = "block";
                                        if (placeholder) placeholder.style.display = "none";
                                    } else if (imgEl) {
                                        imgEl.src = "";
                                        imgEl.style.display = "none";
                                        if (placeholder) placeholder.style.display = "flex";
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" style={{ opacity: creating ? 0.4 : 1, pointerEvents: creating ? "none" : "auto" }}>
                        {creating ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    )
}