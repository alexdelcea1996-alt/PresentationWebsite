<?xml version="1.0" encoding="utf-8"?>
<!--
  What a browser shows when somebody opens the feed address.

  An RSS feed is written for software, and a browser that is handed one with no
  instructions does the only thing it can: prints the source. That is not a
  broken feed, but it reads exactly like one, and the "Subscribe via RSS" link
  on the blog is a link a person clicks — so a person is what lands here.

  A stylesheet declaration at the top of the feed fixes it without touching the
  feed itself. Browsers apply this transform and show the page below; feed
  readers ignore it and parse the XML they came for. If a browser ever drops
  XSLT support, the fallback is the raw XML that was there before — the same
  place we started, never worse.

  Both languages come out of this one file. The feed states its own language and
  everything below switches on it, so the two can no more drift apart here than
  they can in the feed builder they share.

  Links are root-relative, not absolute. The first build of this page derived
  every address from the feed's own <link> — correct-looking, and refused by
  CSP the moment the document was served from anywhere but the canonical
  hostname, because `'self'` means the origin you are on, not the origin you
  are named after. The one address that stays absolute is the feed's own, in
  the box: that one is meant to be copied into another program, where a path
  beginning with a slash means nothing.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" indent="no" doctype-system="about:legacy-compat"/>

  <xsl:variable name="en" select="/rss/channel/language = 'en-us'"/>
  <xsl:variable name="home" select="/rss/channel/link"/>

  <!-- "en/" or nothing. Used as a string, so the <xsl:if> must contain no
       whitespace of its own. -->
  <xsl:variable name="dir">
    <xsl:if test="$en">en/</xsl:if>
  </xsl:variable>

  <xsl:variable name="feed" select="concat($home, $dir, 'rss.xml')"/>
  <xsl:variable name="blog" select="concat('/', $dir, 'blog/')"/>
  <!-- "Alex Delcea — Blog" -> "Alex Delcea", so the name is never typed here. -->
  <xsl:variable name="brand" select="substring-before(/rss/channel/title, ' — ')"/>

  <!--
    RFC-822 dates, as a reader would write them.

    "Wed, 12 Aug 2026 00:00:00 GMT" is fixed-width up to the year, so the parts
    can be sliced out by position. XSLT 1.0 has no date formatting and no month
    table, hence the twelve branches — cheap, and the alternative is showing a
    Romanian reader an English month.
  -->
  <xsl:template name="published">
    <xsl:param name="rfc"/>
    <xsl:variable name="month" select="substring($rfc, 9, 3)"/>
    <xsl:value-of select="substring($rfc, 6, 2)"/>
    <xsl:text> </xsl:text>
    <xsl:choose>
      <xsl:when test="$en"><xsl:value-of select="$month"/></xsl:when>
      <xsl:when test="$month = 'Jan'">ian.</xsl:when>
      <xsl:when test="$month = 'Feb'">feb.</xsl:when>
      <xsl:when test="$month = 'Mar'">mar.</xsl:when>
      <xsl:when test="$month = 'Apr'">apr.</xsl:when>
      <xsl:when test="$month = 'May'">mai</xsl:when>
      <xsl:when test="$month = 'Jun'">iun.</xsl:when>
      <xsl:when test="$month = 'Jul'">iul.</xsl:when>
      <xsl:when test="$month = 'Aug'">aug.</xsl:when>
      <xsl:when test="$month = 'Sep'">sept.</xsl:when>
      <xsl:when test="$month = 'Oct'">oct.</xsl:when>
      <xsl:when test="$month = 'Nov'">nov.</xsl:when>
      <xsl:when test="$month = 'Dec'">dec.</xsl:when>
      <xsl:otherwise><xsl:value-of select="$month"/></xsl:otherwise>
    </xsl:choose>
    <xsl:text> </xsl:text>
    <xsl:value-of select="substring($rfc, 13, 4)"/>
  </xsl:template>

  <xsl:template match="/">
    <html>
      <xsl:attribute name="lang">
        <xsl:choose>
          <xsl:when test="$en">en</xsl:when>
          <xsl:otherwise>ro</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        <link rel="stylesheet" href="/rss.css"/>
      </head>
      <body>
        <div class="wrap">
          <header class="head">
            <a class="mark" href="/">
              <img src="/favicon.svg" alt="" width="30" height="30"/>
            </a>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="lede"><xsl:value-of select="/rss/channel/description"/></p>
          </header>

          <div class="note">
            <p class="note-title">
              <xsl:choose>
                <xsl:when test="$en">This address is a feed, not a page.</xsl:when>
                <xsl:otherwise>Adresa asta e un flux, nu o pagină.</xsl:otherwise>
              </xsl:choose>
            </p>
            <p>
              <xsl:choose>
                <xsl:when test="$en">
                  Paste it into any feed reader — Feedly, NetNewsWire, Thunderbird — and new
                  articles turn up on their own, with no email address and no newsletter.
                  If you would rather just read, everything is listed below.
                </xsl:when>
                <xsl:otherwise>
                  Pune-o într-un cititor de fluxuri — Feedly, NetNewsWire, Thunderbird — și
                  articolele noi ajung singure la tine, fără adresă de e-mail și fără
                  newsletter. Dacă vrei doar să citești, tot ce s-a scris e mai jos.
                </xsl:otherwise>
              </xsl:choose>
            </p>
            <p class="feed-url"><code><xsl:value-of select="$feed"/></code></p>
            <p>
              <a class="btn" href="{$blog}">
                <xsl:choose>
                  <xsl:when test="$en">Read on the blog</xsl:when>
                  <xsl:otherwise>Citește pe blog</xsl:otherwise>
                </xsl:choose>
              </a>
            </p>
          </div>

          <ol class="items">
            <xsl:for-each select="/rss/channel/item">
              <li class="item">
                <p class="meta">
                  <span class="cat"><xsl:value-of select="category"/></span>
                  <xsl:text> · </xsl:text>
                  <xsl:call-template name="published">
                    <xsl:with-param name="rfc" select="pubDate"/>
                  </xsl:call-template>
                </p>
                <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
                <p class="summary"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ol>

          <p class="back">
            <a href="/">
              <xsl:text>&#8592; </xsl:text>
              <xsl:value-of select="$brand"/>
            </a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
