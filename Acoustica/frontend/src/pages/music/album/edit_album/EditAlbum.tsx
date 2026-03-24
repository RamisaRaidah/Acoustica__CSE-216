import "@/pages/music/album/create_album/CreateAlbum.css"
import { useState, useRef, useEffect } from "react";
import { editAlbum } from "@/services/music_service/albums";
import { DatePicker, DatePickerHandle } from "@/components/date_picker/DatePicker";
import { getAlbumDetails, getAlbumCoverPicture } from "@/services/music_service/albums";
import Alert from "@/components/alert/TwoButtonAlert";
import { useNavigate, useParams } from "react-router-dom";
import { setEngine } from "crypto";

export default function EditAlbum() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { album_id } = useParams<{ album_id: string }>();
    const albumId = Number(album_id);
    const formRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<DatePickerHandle>(null);
    const [updating, setUpdating] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [release_date, setReleaseDate] = useState<string>()
    const [privacy, setPrivacy] = useState<string>('');
    const [copyright_certificate, setCopyrightCertificate] = useState<string>('')
    const [cover_picture, setCoverPicture] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [coverAction, setCoverAction] = useState<'keep' | 'replace'>('keep');
    const [copyrightCertificateAction, setCopyrightCertificateAction] = useState<'keep' | 'replace'>('keep');
    const ccInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        async function loadData() {
            try {
                const [album, cover_picture] = await Promise.all([
                    getAlbumDetails(albumId),
                    getAlbumCoverPicture(albumId)
                ]);
                setTitle(album.title);
                setDescription(album.description);
                setPrivacy(album.visibility);
                setCopyrightCertificate(`${album.title.toLowerCase().replace(' ', '_')}_copyright_certificate.pdf`);
                const d = new Date(album.release_date);
                const formattedDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                setReleaseDate(formattedDate);
                setCoverPicture(cover_picture.cover_picture_url);
            }
            catch (e) {
                console.log('ERROR:', e);
                setError('Failed to load data!');
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();
        setTitle('');
        setDescription('');
        setPrivacy('');
        setReleaseDate('');
        setCopyrightCertificate('No file chosen'); 
        setCopyrightCertificateAction('keep');

        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
        const placeholder = document.getElementById("cover-placeholder");
        if (imgEl) { imgEl.src = ""; imgEl.style.display = "none"; }
        if (placeholder) placeholder.style.display = "flex";
    }

    async function handleSubmit() {
        if(!formRef.current) return;

        const formData = new FormData(formRef.current);
        formData.append('cover_action', coverAction);
        formData.append('copyright_certificate_action', copyrightCertificateAction);

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

        try {
            setUpdating(true);
            const response = await editAlbum(albumId, formData);
            if (response) {
                resetForm();
                setAlertMessage("The album is updated successfully!");
            }
        }
        catch(err) {
            const message = err instanceof Error ? err.message : 'Failed to update the album';
            console.log('ERROR', err);
            if (message == 'exists') setAlertMessage('An album with the same title exists!');
            else setAlertMessage("Failed to update the album!");
        }
        finally {
            setUpdating(false);
        }
    }

    if (loading) return <div className='loading'>Loading</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id="create-album-container">
            {alertMessage && <Alert message={alertMessage} type="alert" onConfirm={() => { setAlertMessage(null); if (alertMessage === "The album is updated successfully!") navigate(`/music/albums/${albumId}`) }} />}
            {confirmation && <Alert message='Are you sure to apply the changes?' type='confirm' onConfirm={() => { setConfirmation(false); handleSubmit() }} onCancel={() => setConfirmation(false)}/>}
            
            <div id="create-album-header">
                <h1>Update Album</h1>
            </div>

            <form ref={formRef} id="create-album-form" encType="multipart/form-data" onSubmit={(e) => { e.preventDefault(); setConfirmation(true); }} autoComplete="off">

                <div id="create-album-form-left">
                    <div className="form-group">
                        <label>Album Title<span style={{ color: "#e07b2a" }}>*</span></label>
                        <input
                            type="text"
                            name="album_title"
                            placeholder="Enter album title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Album description…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div id="create-album-form-left-middle">
                        <div className="form-group" id="release-date-container">
                            <label>Release Date<span style={{ color: "#e07b2a" }}>*</span></label>
                            <DatePicker ref={datePickerRef} name="release_date" initialValue={release_date}/>
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
                            <span className="file-name">{copyright_certificate}</span>
                            {copyright_certificate && copyright_certificate !== 'No file chosen' && (
                                <button type='button' className='tag-remove-btn' onClick={(e) => {
                                    e.preventDefault();
                                    setCopyrightCertificate('No file chosen');
                                    setCopyrightCertificateAction('keep'); 
                                    if (ccInputRef.current) ccInputRef.current.value = '';
                                }}>×</button>
                            )}
                            <input
                                ref={ccInputRef}
                                type="file"
                                name="copyright_certificate"
                                accept=".pdf"
                                onChange={(e) => {
                                    setCopyrightCertificateAction('replace');
                                    setCopyrightCertificate(e.target.files?.[0]?.name ?? 'No file chosen');
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div id="create-album-form-right">
                    <div className="form-group">
                        <label>Cover Picture</label>
                        <div id="cover-picture" onClick={() => document.getElementById("cover-input")?.click()}>
                            <img id="cover-preview" src={cover_picture ?? ''} style={{ display: cover_picture ? "block" : "none" }} />
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
                                    setCoverAction('replace');
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

                    <button type="submit" style={{ opacity: updating ? 0.4 : 1, pointerEvents: updating ? "none" : "auto" }}>
                        {updating ? "Updating..." : "Update Album"}
                    </button>
                </div>
            </form>
        </div>
    )
}