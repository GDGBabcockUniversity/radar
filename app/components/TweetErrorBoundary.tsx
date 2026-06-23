"use client";

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class TweetErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Tweet Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="my-6 p-4 border border-edge bg-overlay text-content-muted rounded-lg text-center text-sm max-w-lg mx-auto">
          Embedded tweet could not be loaded. It may have been deleted.
        </div>
      );
    }

    return this.props.children;
  }
}
