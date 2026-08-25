import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { docUrl, userId, institutionCode } = await request.json();
    if (!docUrl || !userId) {
      return NextResponse.json({ error: "Eksik bilgi gonderildi." }, { status: 400 });
    }

    // 1. PDF dosyasini indir
    const res = await fetch(docUrl);
    if (!res.ok) throw new Error("Dosya okunamadi.");
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Metin analizi (sadece PDF ise pdf-parse calisir)
    let text = "";
    if (docUrl.toLowerCase().endsWith(".pdf")) {
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      text = data.text.toUpperCase();
    } else {
      return NextResponse.json({ 
        success: false,
        error: "Yapay zeka gorsel okuyamiyor, manuel onaya alinmistir." 
      });
    }

    // 3. Kurallar
    const normalize = (str: string) => {
      return str
        .replace(/İ/g, 'I')
        .replace(/Ğ/g, 'G')
        .replace(/Ş/g, 'S')
        .replace(/Ç/g, 'C')
        .replace(/Ö/g, 'O')
        .replace(/Ü/g, 'U');
    };
    
    const normText = normalize(text);

    const hasMeb = normText.includes("MILLI EGITIM") || normText.includes("GOREV BELGESI");
    const hasTeacher = normText.includes("OGRETMEN");

    if (hasMeb && hasTeacher) {
      // 4. Onaylandi
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          teacher_status: "verified",
          institution_code: institutionCode || null,
          verification_doc_url: docUrl
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Yuklenen belge gecerli bir MEB Ogretmenlik Gorev Belgesi olarak dogrulanamadi." 
      });
    }

  } catch (err: any) {
    console.error("Auto Verify Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
