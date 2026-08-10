defmodule AtsWeb.Api.JobControllerTest do
  use AtsWeb.ConnCase

  import Ats.AccountsFixtures
  import Ats.JobsFixtures

  describe "index" do
    test "returns all jobs when no filters are provided", %{conn: conn} do
      first_job = job_fixture(title: "Backend Engineer")
      second_job = job_fixture(title: "Product Designer")

      conn = get(conn, ~p"/api/jobs")

      assert response_ids(conn) == [first_job.id, second_job.id] |> Enum.sort()
    end

    test "filters jobs by a case-insensitive partial title", %{conn: conn} do
      matching_job = job_fixture(title: "Senior Elixir Engineer")
      _other_job = job_fixture(title: "Product Designer")

      conn = get(conn, ~p"/api/jobs", title: "ELIXIR")

      assert response_ids(conn) == [matching_job.id]
    end

    test "filters jobs by a case-insensitive partial location", %{conn: conn} do
      matching_job = job_fixture(office: "Paris, France")
      _other_job = job_fixture(office: "Berlin, Germany")

      conn = get(conn, ~p"/api/jobs", location: "FRANCE")

      assert response_ids(conn) == [matching_job.id]
    end

    test "filters jobs by case-insensitive exact work mode", %{conn: conn} do
      matching_job = job_fixture(work_mode: "remote")
      _other_job = job_fixture(work_mode: "hybrid")

      conn = get(conn, ~p"/api/jobs", work_mode: "REMOTE")

      assert response_ids(conn) == [matching_job.id]
    end

    test "combines filters with AND", %{conn: conn} do
      matching_job = job_fixture(title: "Elixir Engineer", office: "Paris", work_mode: "hybrid")

      _wrong_location =
        job_fixture(title: "Elixir Engineer", office: "Berlin", work_mode: "hybrid")

      _wrong_work_mode =
        job_fixture(title: "Elixir Engineer", office: "Paris", work_mode: "remote")

      _wrong_title = job_fixture(title: "Product Designer", office: "Paris", work_mode: "hybrid")

      conn = get(conn, ~p"/api/jobs", title: "elixir", location: "par", work_mode: "HYBRID")

      assert response_ids(conn) == [matching_job.id]
    end

    test "returns an empty list when no jobs match", %{conn: conn} do
      _job = job_fixture(title: "Backend Engineer")

      conn = get(conn, ~p"/api/jobs", title: "no such role")

      assert json_response(conn, 200) == %{"data" => []}
    end

    test "allows an authenticated user to filter jobs", %{conn: conn} do
      user = user_fixture()
      matching_job = job_fixture(work_mode: "remote")
      _other_job = job_fixture(work_mode: "onsite")
      token = Phoenix.Token.sign(AtsWeb.Endpoint, "user auth", user.id)

      conn =
        conn
        |> put_req_header("authorization", "Bearer #{token}")
        |> get(~p"/api/jobs", work_mode: "remote")

      assert response_ids(conn) == [matching_job.id]
    end
  end

  defp response_ids(conn) do
    conn
    |> json_response(200)
    |> Map.fetch!("data")
    |> Enum.map(&Map.fetch!(&1, "id"))
    |> Enum.sort()
  end
end
