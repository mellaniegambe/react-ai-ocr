import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Loader2, CheckCircle2 } from "lucide-react";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModes, setViewModes] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("timecard_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        // extracted_data is already an object, no need to parse
        const parsed = data.map((row) => ({
          id: row.id,
          image_url: row.image_url,
          data: row.extracted_data || {},
          created_at: row.created_at,
        }));
        setHistory(parsed);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const toggleViewMode = (index, mode) => {
    setViewModes((prev) => ({ ...prev, [index]: mode }));
  };

  return (
    <div className="min-h-screen bg-gradient from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Extraction History
          </h1>
          <p className="text-slate-600">
            View all previously extracted time cards
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-6">
            {history.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Preview */}
                  <div className="relative bg-slate-50 p-8 flex items-center justify-center min-h-[300px]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={`Timecard ${idx + 1}`}
                        className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md"
                      />
                    ) : (
                      <div className="text-slate-400 italic">
                        No image available
                      </div>
                    )}

                    {/* Completed badge */}
                    {item.data && Object.keys(item.data).length > 0 && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-slate-700 font-medium">
                          Done
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Extracted Data */}
                  <div className="p-8 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Extraction {idx + 1} -{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </h3>
                      <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>

                    {item.data ? (
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
                            {JSON.stringify(item.data, null, 2)}
                          </pre>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl p-6 space-y-6">
                            {/* Employee Information */}
                            {item.data.employee_information &&
                            Object.keys(item.data.employee_information).length >
                              0 ? (
                              <div>
                                <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                  Employee Information
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                  {Object.entries(
                                    item.data.employee_information
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

                            {/* Total Hours */}
                            {item.data.total_hours !== undefined && (
                              <div>
                                <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                  Total Hours
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                  <p className="text-xl font-bold text-slate-900">
                                    {item.data.total_hours || "—"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Attendance Records */}
                            {Array.isArray(item.data.attendance_records) &&
                            item.data.attendance_records.length > 0 ? (
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
                                      {item.data.attendance_records.map(
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
                                                {record[field] || "—"}
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
                      <p className="text-slate-400 text-sm">
                        No data available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-12">No history found.</p>
        )}
      </div>
    </div>
  );
}

export default History;
