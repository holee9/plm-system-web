// New Project Page
import { ProjectCreateForm } from "@/components/projects";

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new project for your team to collaborate on
        </p>
      </div>

      <ProjectCreateForm />
    </div>
  );
}
