defmodule LiveMet.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      LiveMetWeb.Telemetry,
      LiveMet.Repo,
      {DNSCluster, query: Application.get_env(:livemet, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: LiveMet.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: LiveMet.Finch},
      # Start a worker by calling: LiveMet.Worker.start_link(arg)
      # {LiveMet.Worker, arg},
      # Start to serve requests, typically the last entry
      LiveMetWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: LiveMet.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    LiveMetWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
