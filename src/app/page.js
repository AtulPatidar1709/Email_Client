"use client";

import EmailList from "../components/EmailList";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
  return (
    <div className="w-11/12">
      <EmailList />
    </div>
  );
}
