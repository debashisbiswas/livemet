defmodule LiveMet.Repo do
  use Ecto.Repo,
    otp_app: :livemet,
    adapter: Ecto.Adapters.Postgres
end
