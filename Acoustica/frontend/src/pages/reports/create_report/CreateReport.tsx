import "@/pages/reports/create_report/CreateReport.css";
import Alert from "@/components/alert/TwoButtonAlert";
import { useState } from "react";
import { createPortal } from "react-dom";
import Searchbar from "@/components/searchbar/Searchbar";
import { createReport } from "@/services/social_service/posts";

interface CreateReportProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateReport({ isOpen, onClose }: CreateReportProps) {
    const [alert, setAlert] = useState<string>("");
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [contentId, setContentId] = useState<number | undefined>();
    const [contentType, setContentType] = useState<string>("");
    const [contentTitle, setContentTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [submitting, setSubmitting] = useState<boolean>(false);

    function reset() {
        setContentId(undefined);
        setContentType("");
        setContentTitle("");
        setDescription("");
        setSelectedFile(undefined);
    }

    async function handleSubmit() {
        if (contentId === undefined) {
            setAlert("Please select a content to report!");
            return;
        }
        if (!description.trim()) {
            setAlert("Please provide the description!");
            return;
        }
        try {
            setSubmitting(true);
            const response = await createReport(contentId, { text: description, image: selectedFile });
            if (response.message) {
                reset();
                setAlert("The report is submitted successfully!");
            }
        } catch (err) {
            setAlert("Failed to submit the report!");
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return createPortal(
        <div className="cr_overlay">
            {alert && (
                <Alert
                    type="alert"
                    message={alert}
                    onConfirm={() => setAlert("")}
                />
            )}
            {confirmation && (
                <Alert
                    type="confirm"
                    message="Are you sure you want to submit this report?"
                    onConfirm={() => { setConfirmation(false); handleSubmit(); }}
                    onCancel={() => setConfirmation(false)}
                />
            )}

            <div className="cr_popup" onClick={e => e.stopPropagation()}>
                <div className="cr_header">
                    <h2 className="cr_title">Report</h2>
                    <button className="cr_close" onClick={onClose}>✕</button>
                </div>

                <div className="cr_body">
                    <Searchbar
                        prompt="Find content to report..."
                        song album artist playlist
                        onSongSelect={x => { setContentId(x.asset_id); setContentType("Song"); setContentTitle(x.title); }}
                        onAlbumSelect={x => { setContentId(x.asset_id); setContentType("Album"); setContentTitle(x.title); }}
                        onArtistSelect={x => { setContentId(x.asset_id); setContentType("Artist"); setContentTitle(x.artist_name); }}
                        onPlaylistSelect={x => { setContentId(x.asset_id); setContentType("Playlist"); setContentTitle(x.title); }}
                        prevent_default
                    />

                    {(contentType || contentTitle) && (
                        <div className="cr_tags">
                            <span className="cr_tag cr_tag--label">Content type:</span>
                            <span className="cr_tag cr_tag--value">{contentType || "—"}</span>
                            <span className="cr_tag cr_tag--label">Content title:</span>
                            <span className="cr_tag cr_tag--value">{contentTitle || "—"}</span>
                        </div>
                    )}

                    <div className="cr_field_group">
                        <label className="cr_label">Description</label>
                        <div className="cr_desc_row">
                            <textarea
                                className="cr_textarea"
                                placeholder="Describe the issue..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <div
                                className="cr_file_picker"
                                onClick={() => document.getElementById("cr-file-input")?.click()}
                            >
                                {selectedFile
                                    ? <img src={URL.createObjectURL(selectedFile)} className="cr_file_preview" alt="preview" />
                                    : <span className="cr_file_plus">+</span>
                                }
                                <input
                                    id="cr-file-input"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={e => setSelectedFile(e.target.files?.[0])}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className="cr_submit"
                        onClick={() => setConfirmation(true)}
                        disabled={submitting}
                        style={{ opacity: submitting ? 0.5 : 1 }}
                    >
                        {submitting ? "Submitting…" : "Submit"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}