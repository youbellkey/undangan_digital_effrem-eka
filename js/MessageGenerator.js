/* ==========================================================================
   MessageGenerator.js
   Generates personalized WhatsApp invitation messages.
   Used by: admin panel (Copy WhatsApp button per guest).
   ========================================================================== */

class MessageGenerator {
  /**
   * Generate a fully personalized WhatsApp message for a guest.
   *
   * @param {Object} guest      - Guest object from guests.json
   * @param {string} baseUrl    - Deployment root, e.g. "https://example.vercel.app"
   * @returns {string}          - Ready-to-paste WhatsApp message
   */
  static generate(guest, baseUrl) {
    const url = MessageGenerator.inviteUrl(guest, baseUrl);
    return (
      'Kepada Yth.\n'                                                                +
      'Bapak/Ibu/Saudara/i\n'                                                        +
      guest.displayName + '\n\n'                                                      +
      'Salam sejahtera bagi kita semua.\n\n'                                          +
      'Dengan penuh rasa syukur kepada Tuhan Yang Maha Esa, kami mengundang '        +
      'Bapak/Ibu/Saudara/i ' + guest.displayName + ' untuk hadir dan menjadi '      +
      'bagian dari sukacita dalam pemberkatan dan resepsi pernikahan kami.\n\n'       +
      'Berikut tautan undangan kami:\n\n'                                             +
      url + '\n\n'                                                                    +
      'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila '                +
      'Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa dan restu.\n\n'       +
      'Kiranya Tuhan senantiasa melimpahkan kesehatan, damai sejahtera dan '         +
      'penyertaan-Nya.\n\n'                                                           +
      'Terima kasih.\n\n'                                                             +
      'Hormat kami,\n\n'                                                              +
      'Effrem & Eka\n'                                                                +
      'beserta keluarga'
    );
  }

  /**
   * Return just the invitation URL for a guest.
   *
   * @param {Object} guest
   * @param {string} baseUrl
   * @returns {string}
   */
  static inviteUrl(guest, baseUrl) {
    return baseUrl.replace(/\/$/, '') + '/invite/' + guest.token;
  }
}
