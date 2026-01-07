import { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { extractData } from "./lib/ai";
import { uploadImageAndSaveResult } from "./lib/saveResult";

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [viewModes, setViewModes] = useState({});

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previewPromises = selectedFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) =>
            resolve({ name: file.name, url: ev.target.result });
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((p) => {
      setPreviews(p);
      // reset results to match the number of previews (no results yet)
      setResults(p.map(() => null));
      setViewModes({});
    });
  };
  const handleExtract = async () => {
    if (!files.length) return alert("Please select files first.");

    // Initialize per-file loading state
    setResults(files.map(() => ({ loading: true })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Extract data
        const result = await extractData(file);

        // Normalize the data for UI
        const data = {
          employee_information: result?.data?.employee_information || {},
          attendance_records: Array.isArray(result?.data?.attendance_records)
            ? result.data.attendance_records
            : [],
          total_hours: result?.data?.total_hours || 0,
        };

        // Update UI for this file
        setResults((prev) => {
          const updated = [...prev];
          updated[i] = {
            data,
            image_url: null, // optional if you want to use the preview image
            message:
              Object.keys(data).length === 0 ? "No data extracted" : null,
            loading: false,
          };
          return updated;
        });
      } catch (err) {
        setResults((prev) => {
          const updated = [...prev];
          updated[i] = {
            data: {
              employee_information: {},
              attendance_records: [],
              total_hours: 0,
            },
            image_url: null,
            error: err.message || "Unknown error",
            loading: false,
          };
          return updated;
        });
      }
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setResults((prev) => prev.filter((_, i) => i !== index));
    setViewModes((prev) => {
      const updated = { ...prev };
      // Remove the specific key and also shift any later indices down
      delete updated[index];
      // rebuild viewModes to shift indices so they line up with updated lists
      const newVM = {};
      Object.keys(updated)
        .map((k) => Number(k))
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => a - b)
        .forEach((oldIndex, newIndex) => {
          newVM[newIndex] = updated[oldIndex];
        });
      return newVM;
    });
  };

  const toggleViewMode = (index, mode) => {
    setViewModes((prev) => ({ ...prev, [index]: mode }));
  };

  return (
    <div className="min-h-screen bg-gradient from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Time Card Extractor
          </h1>
          <p className="text-slate-600">
            Upload your time card images and extract data automatically
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
              <p className="mb-2 text-sm font-medium text-slate-700">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG or JPEG (Multiple files supported)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <button
                onClick={handleExtract}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                disabled={files.length === 0}
                title="Extract data per image"
              >
                Extract Data
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {previews.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Results / Preview
            </h2>

            {previews.map((preview, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Preview */}
                  <div className="relative bg-slate-50 p-8 flex items-center justify-center min-h-[300px]">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md"
                    />

                    {/* Individual Spinner Overlay */}
                    {results[idx]?.loading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      </div>
                    )}

                    {/* Completed badge */}
                    {results[idx]?.data && !results[idx]?.loading && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-slate-700 font-medium">
                          Done
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>

                  {/* Extracted Data */}
                  <div className="p-8 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {preview.name}
                      </h3>
                      <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>

                    {/* Error */}
                    {results[idx]?.error && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl w-full">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                          {results[idx].error}
                        </p>
                      </div>
                    )}

                    {/* Data */}
                    {results[idx]?.data ? (
                      <div className="flex-1">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 mb-4">
                          {["ui", "json"].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => toggleViewMode(idx, mode)}
                              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                                viewModes[idx] === mode ||
                                (!viewModes[idx] && mode === "ui")
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {mode === "ui" ? "UI View" : "JSON View"}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        {viewModes[idx] === "json" ? (
                          <pre className="bg-slate-50 text-slate-800 text-sm rounded-xl p-4 overflow-auto max-h-[400px] border border-slate-200">
                            {JSON.stringify(results[idx].data, null, 2)}
                          </pre>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl p-6 space-y-6">
                            {/* Employee Information */}
                            {results[idx].data.employee_information &&
                            Object.keys(results[idx].data.employee_information)
                              .length > 0 ? (
                              <div>
                                <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                  Employee Information
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                  {Object.entries(
                                    results[idx].data.employee_information
                                  ).map(([key, value]) => (
                                    <div key={key}>
                                      <p className="text-xs uppercase text-slate-500 font-medium mb-1">
                                        {key.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-slate-800 font-medium">
                                        {value || "—"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-500 italic text-sm">
                                No employee information found.
                              </p>
                            )}

                            {/* Total Hours (new) */}
                            {results[idx].data.total_hours !== undefined ? (
                              <div>
                                <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                  Total Hours
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                  <p className="text-xl font-bold text-slate-900">
                                    {results[idx].data.total_hours || "—"}
                                  </p>
                                </div>
                              </div>
                            ) : null}

                            {/* Attendance Records */}
                            {Array.isArray(
                              results[idx].data.attendance_records
                            ) &&
                            results[idx].data.attendance_records.length > 0 ? (
                              <div>
                                <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                  Attendance Records
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                  <table className="min-w-full bg-white border-collapse">
                                    <thead>
                                      <tr className="bg-blue-50 text-slate-700 text-sm">
                                        {[
                                          "Date",
                                          "Morning In",
                                          "Morning Out",
                                          "Afternoon In",
                                          "Afternoon Out",
                                          "Overtime In",
                                          "Overtime Out",
                                        ].map((header) => (
                                          <th
                                            key={header}
                                            className="px-4 py-2 text-left font-semibold border-b"
                                          >
                                            {header}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {results[idx].data.attendance_records.map(
                                        (record, i) => (
                                          <tr
                                            key={i}
                                            className="text-sm hover:bg-slate-50 transition-colors"
                                          >
                                            {[
                                              "date",
                                              "morning_in",
                                              "morning_out",
                                              "afternoon_in",
                                              "afternoon_out",
                                              "overtime_in",
                                              "overtime_out",
                                            ].map((field) => (
                                              <td
                                                key={field}
                                                className="px-4 py-2 border-b text-slate-700"
                                              >
                                                {record && record[field]
                                                  ? record[field]
                                                  : "—"}
                                              </td>
                                            ))}
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-500 italic text-sm">
                                No attendance records found.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // No result yet for this index
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                          Click "Extract Data" to analyze this image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <Upload className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600">
              Upload time card images to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
