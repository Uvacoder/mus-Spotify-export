import i18n from "../../i18n/config"
import TracksData from "./TracksData"
import { apiCall } from "helpers"

class TracksBaseData extends TracksData {
  playlist: any

  constructor(accessToken: string, playlist: any) {
    super(accessToken)
    this.playlist = playlist
  }

  dataLabels() {
    return [
      i18n.t("track.track_uri"),
      i18n.t("track.track_name"),
      i18n.t("track.artist_uris"),
      i18n.t("track.artist_names"),
      i18n.t("track.album_uri"),
      i18n.t("track.album_name"),
      i18n.t("track.album_artist_uris"),
      i18n.t("track.album_artist_names"),
      i18n.t("track.album_release_date"),
      i18n.t("track.album_image_url"),
      i18n.t("track.disc_number"),
      i18n.t("track.track_number"),
      i18n.t("track.track_duration"),
      i18n.t("track.track_preview_url"),
      i18n.t("track.explicit"),
      i18n.t("track.popularity"),
      i18n.t("track.isrc"),
      i18n.t("track.is_playable")
    ]
  }

  async trackItems() {
    await this.getPlaylistItems()

    return this.playlistItems
  }

  async data() {
    await this.getPlaylistItems()

    return new Map(this.playlistItems.map(item => {
      return [
        item.track.uri,
        [
          item.track.uri,
          item.track.name,
          item.track.artists.map((a: any) => { return a.uri }).join(', '),
          item.track.artists.map((a: any) => { return String(a.name).replace(/,/g, "\\,") }).join(', '),
          item.track.album.uri == null ? '' : item.track.album.uri,
          item.track.album.name,
          item.track.album.artists.map((a: any) => { return a.uri }).join(', '),
          item.track.album.artists.map((a: any) => { return String(a.name).replace(/,/g, "\\,") }).join(', '),
          item.track.album.release_date == null ? '' : item.track.album.release_date,
          item.track.album.images[0] == null ? '' : item.track.album.images[0].url,
          item.track.disc_number,
          item.track.track_number,
          item.track.duration_ms,
          item.track.preview_url == null ? '' : item.track.preview_url,
          item.track.explicit,
          item.track.popularity,
          item.track.external_ids.isrc == null ? '' : item.track.external_ids.isrc,
          item.track.is_playable
        ]
      ]
    }))
  }

  // Memoization supporting multiple calls
  private playlistItems: any[] = []
  private async getPlaylistItems() {
    if (this.playlistItems.length > 0) {
      return this.playlistItems
    }

    var requests = []
    var limit = this.playlist.tracks.limit ? 50 : 100

    for (var offset = 0; offset < this.playlist.tracks.total; offset = offset + limit) {
      requests.push(`${this.playlist.tracks.href.split('?')[0]}?offset=${offset}&limit=${limit}&market=from_token`)
    }

    const trackPromises = requests.map(request => { return apiCall(request, this.accessToken) })
    const trackResponses = await Promise.all(trackPromises)

    this.playlistItems = trackResponses.flatMap(response => {
      return response.data.items.filter((i: any) => i.track) // Exclude null track attributes
    })
  }
}

export default TracksBaseData
