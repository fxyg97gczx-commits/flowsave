import { NextResponse } from "next/server";
import { getBugReportEmail, getBugReportGithubUrl } from "@/lib/bugReportServer";

export async function GET() {
  return NextResponse.json({
    email: getBugReportEmail(),
    githubUrl: getBugReportGithubUrl(),
  });
}
