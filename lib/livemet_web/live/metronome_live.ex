defmodule LiveMetWeb.MetronomeLive do
  use LiveMetWeb, :live_view

  @topic "metronome_events"

  def render(assigns) do
    ~H"""
    <.header class="text-xl"><%= @tempo %> BPM</.header>
    <.button class="p-4 border" phx-click="dec_bpm">-</.button>
    <.button class="p-4 border" phx-click="inc_bpm">+</.button>
    <.button class="p-4 border" phx-click="toggle"><%= @status %></.button>
    """
  end

  def mount(_params, _session, socket) do
    if connected?(socket) do
      LiveMetWeb.Endpoint.subscribe(@topic)
    end

    socket =
      socket
      |> assign(:tempo, 60)
      |> assign(:status, false)

    {:ok, socket}
  end

  defp update_tempo(socket, update_function) do
    new_tempo = update_function.(socket.assigns.tempo)
    LiveMetWeb.Endpoint.broadcast(@topic, "bpm_change", %{bpm: new_tempo})

    socket
    |> assign(:tempo, new_tempo)
    |> push_event("bpm_change", %{bpm: new_tempo})
  end

  def handle_event("dec_bpm", _params, socket) do
    socket = update_tempo(socket, &(&1 - 10))
    {:noreply, socket}
  end

  def handle_event("inc_bpm", _params, socket) do
    socket = update_tempo(socket, &(&1 + 10))
    {:noreply, socket}
  end

  def handle_event("toggle", _params, socket) do
    new_status = !socket.assigns.status

    socket =
      socket
      |> assign(:status, new_status)
      |> push_event("toggle_event", %{status: new_status})

    LiveMetWeb.Endpoint.broadcast(@topic, "status_change", %{playing: new_status})
    {:noreply, socket}
  end

  def handle_info(%{payload: %{bpm: new_tempo}}, socket) do
    {:noreply, assign(socket, :tempo, new_tempo)}
  end

  def handle_info(%{payload: %{playing: new_status}}, socket) do
    {:noreply, assign(socket, :status, new_status)}
  end
end
