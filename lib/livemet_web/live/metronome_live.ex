defmodule LiveMetWeb.MetronomeLive do
  use LiveMetWeb, :live_view

  @topic "metronome_events"

  def render(assigns) do
    ~H"""
    <div class="w-1/3">
      <h1 class="text-center text-9xl tracking-tight">
        <%= @tempo %><span class="text-xl font-normal tracking-normal">BPM</span>
      </h1>

      <div class="flex mt-8 space-x-6">
        <.button class="p-4 border flex-grow" phx-click="dec_bpm">-</.button>
        <.button class="p-4 border flex-grow" phx-click="inc_bpm">+</.button>
      </div>

      <div class="flex mt-8 space-x-6">
        <.button class="p-4 border w-100 flex-grow" phx-click="toggle">
          <%= if @status do %>
            Playing
          <% else %>
            Stopped
          <% end %>
        </.button>
      </div>
    </div>
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
  end

  def handle_event("dec_bpm", _params, socket) do
    update_tempo(socket, &(&1 - 10))
    {:noreply, socket}
  end

  def handle_event("inc_bpm", _params, socket) do
    update_tempo(socket, &(&1 + 10))
    {:noreply, socket}
  end

  def handle_event("toggle", _params, socket) do
    new_status = !socket.assigns.status
    LiveMetWeb.Endpoint.broadcast(@topic, "status_change", %{playing: new_status})
    {:noreply, socket}
  end

  def handle_info(%{payload: %{bpm: new_tempo}}, socket) do
    socket =
      socket
      |> assign(:tempo, new_tempo)
      |> push_event("bpm_change", %{bpm: new_tempo})

    {:noreply, socket}
  end

  def handle_info(%{payload: %{playing: new_status}}, socket) do
    socket =
      socket
      |> assign(:status, new_status)
      |> push_event("toggle_event", %{status: new_status})

    {:noreply, socket}
  end
end
