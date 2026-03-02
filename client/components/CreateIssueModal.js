'use client';
import { useState } from 'react';

export default function CreateIssueModal({ constants, onClose, onCreated, addToast, postJSON, API }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        project: '',
        priority: '',
        assignee: '',
        status: 'Open'
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.description.trim()) e.description = 'Description is required';
        if (!form.project) e.project = 'Project is required';
        if (!form.priority) e.priority = 'Priority is required';
        if (!form.assignee) e.assignee = 'Assignee is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await postJSON(`${API}/issues`, form);
            onCreated();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Issue</h2>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Brief summary of the issue"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                            {errors.title && <div className="form-error">{errors.title}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Detailed description of the issue..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                            {errors.description && <div className="form-error">{errors.description}</div>}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Project *</label>
                                <select
                                    className="form-select"
                                    value={form.project}
                                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                                >
                                    <option value="">Select project</option>
                                    {constants.projects.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {errors.project && <div className="form-error">{errors.project}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority *</label>
                                <select
                                    className="form-select"
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                >
                                    <option value="">Select priority</option>
                                    {constants.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {errors.priority && <div className="form-error">{errors.priority}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Assignee *</label>
                                <select
                                    className="form-select"
                                    value={form.assignee}
                                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                                >
                                    <option value="">Select assignee</option>
                                    {constants.teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                                {errors.assignee && <div className="form-error">{errors.assignee}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    {constants.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <><span className="spinner"></span> Creating...</> : 'Create Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
