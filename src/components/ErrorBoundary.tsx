import React, { Component, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="text-xl font-bold text-foreground">Something went wrong</h3>
          <p className="text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
