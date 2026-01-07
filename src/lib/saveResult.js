import { supabase } from "./supabase";

export const uploadImageAndSaveResult = async (file, result) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  // Upload image
  const { error: uploadError } = await supabase.storage
    .from("timecards")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage.from("timecards").getPublicUrl(fileName);

  // Save extracted data
  const { error: insertError } = await supabase
    .from("timecard_results")
    .insert({
      image_url: data.publicUrl,
      extracted_data: result.data,
    });

  if (insertError) throw insertError;
};
