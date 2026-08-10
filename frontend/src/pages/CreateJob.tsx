import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "welcome-ui/Button";
import { Card } from "welcome-ui/Card";
import { Field } from "welcome-ui/Field";
import { Hint } from "welcome-ui/Hint";
import { InputText } from "welcome-ui/InputText";
import { Link as WUILink } from "welcome-ui/Link";
import { Select } from "welcome-ui/Select";
import { Text } from "welcome-ui/Text";
import { Textarea } from "welcome-ui/Textarea";

import {
  CONTRACT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  WORK_MODE_OPTIONS,
} from "../api/job-options";

export const CreateJob = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractType, setContractType] = useState("FULL_TIME");
  const [office, setOffice] = useState("");
  const [status, setStatus] = useState("draft");
  const [workMode, setWorkMode] = useState("onsite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job: {
            title,
            description,
            contract_type: contractType,
            office,
            status,
            work_mode: workMode,
            profession_id: 1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Create job failed");
      }

      void navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div className="p-xl max-w-1200 my-0 mx-auto">
      <WUILink
        as={Link}
        to="/"
        variant="secondary"
        className="mb-md inline-block"
      >
        ← Back to jobs
      </WUILink>

      <Text variant="heading-xl" className="mb-lg">
        Create New Job
      </Text>

      <Card style={{ overflow: "visible" }}>
        <Card.Body style={{ overflow: "visible" }}>
          {error && (
            <Hint variant="danger" className="mb-md">
              {error}
            </Hint>
          )}

          <form onSubmit={(event) => void handleSubmit(event)}>
            <Field label="Title" required className="mb-md">
              <InputText
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            <Field label="Description" className="mb-md">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={4}
              />
            </Field>

            <Field label="Contract Type" required className="mb-md">
              <Select
                name="contract_type"
                value={contractType}
                options={CONTRACT_TYPE_OPTIONS}
                onChange={(value) => setContractType(String(value))}
              />
            </Field>

            <Field label="Office" required className="mb-md">
              <InputText
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                placeholder="e.g. Paris, Remote, London…"
                required
              />
            </Field>

            <Field label="Status" className="mb-md">
              <Select
                name="status"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(value) => setStatus(String(value))}
              />
            </Field>

            <Field label="Work Mode" className="mb-md">
              <Select
                name="work_mode"
                value={workMode}
                options={WORK_MODE_OPTIONS}
                onChange={(value) => setWorkMode(String(value))}
              />
            </Field>

            <Button type="submit" disabled={loading} isLoading={loading}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};
