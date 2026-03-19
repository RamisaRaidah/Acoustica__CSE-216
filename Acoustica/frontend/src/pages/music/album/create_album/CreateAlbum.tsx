import "@/pages/music/album/create_album/CreateAlbum.css"
import { useState, useRef, useEffect } from "react";
import { createAlbum } from "@/services/music_service/albums";
import { DatePicker, DatePickerHandle } from "@/components/date_picker/DatePicker";
import Alert from "@/components/alert/TwoButtonAlert";

export default function CreateAlbum() {
    const formRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<DatePickerHandle>(null);
    const [creating, setCreating] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [privacy, setPrivacy] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const visibilityOptions = [
        { label: "Private", value: "private" },
        { label: "Public", value: "public" }
    ];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const dropdown = document.getElementById("visibility-dropdown");
            if (dropdown && !dropdown.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();
        setPrivacy('');

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

        if (!formData.get('album_title')?.toString().trim()) {
            setAlertMessage('Please enter a title!');
            return;
        }
        else if (!formData.get('release_date')?.toString().trim()) {
            setAlertMessage('Please enter the release date!');
            return;
        }
        else if (!formData.get('visibility')?.toString().trim()) {
            setAlertMessage('Please select visibility!');
            return;
        }
        else if (!(formData.get('copyright_certificate') as File).name) {
            setAlertMessage('Please provide copyright certificate!');
            return;
        }
        
        try {
            setCreating(true);
            const response = await createAlbum(formData);
            if (response) {
                resetForm();
                setAlertMessage("The album is created successfully!");
            }
        }
        catch(err) {
            const message = err instanceof Error ? err.message : 'Failed to create the album';
            console.log('ERROR', err);
            if (message == 'exists') setAlertMessage('An album with the same title exists!');
            else setAlertMessage("Failed to create the album!");
        }
        finally {
            setCreating(false);
        }
    }

    return (
        <div id="create-album-container">
            {alertMessage && <Alert message={alertMessage} type="alert" onConfirm={() => setAlertMessage(null)}/>}

            <div id="create-album-header">
                <h1>Create Album</h1>
            </div>

            <form ref={formRef} id="create-album-form" encType="multipart/form-data" onSubmit={handleSubmit} autoComplete="off">

                <div id="create-album-form-left">
                    <div className="form-group">
                        <label>Album Title<span style={{ color: "#e07b2a" }}>*</span></label>
                        <input
                            type="text"
                            name="album_title"
                            placeholder="Enter album title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                        />
                    </div>

                    <div id="create-album-form-left-middle">
                        <div className="form-group" id="release-date-container">
                            <label>Release Date<span style={{ color: "#e07b2a" }}>*</span></label>
                            <DatePicker ref={datePickerRef} name="release_date" />
                        </div>

                        <div className="form-group" id="visibility-container">
                            <label>Visibility <span style={{ color: "#e07b2a" }}>*</span></label>
                            <div id="visibility-dropdown">
                                <div
                                    id="visibility-selected"
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                >
                                    <span>
                                        {visibilityOptions.find(v => v.value === privacy)?.label || "Select visibility"}
                                    </span>
                                    <svg
                                        className={isDropdownOpen ? "rotate" : ""}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>

                                {isDropdownOpen && (
                                    <div id="visibility-options">
                                        {visibilityOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`visibility-option ${privacy === option.value ? "active" : ""}`}
                                                onClick={() => {
                                                    setPrivacy(option.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input type="hidden" name="visibility" value={privacy} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Copyright Certificate<span style={{ color: "#e07b2a" }}>*</span></label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name" id="cert-name">No file chosen</span>
                            <input
                                type="file"
                                name="copyright_certificate"
                                accept=".pdf"
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