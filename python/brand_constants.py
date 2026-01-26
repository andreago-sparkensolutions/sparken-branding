"""
Sparken Brand Identity System - Constants
All brand colors, fonts, and layout specifications in one place.
"""

from reportlab.lib import colors

# ============================================================================
# COLOR PALETTE - Sparken Brand Colors
# ============================================================================

class BrandColors:
    """Sparken brand color palette - RGB values normalized to 0-1 for ReportLab"""
    
    # Primary Colors
    BRAND_PURPLE = colors.Color(94/255, 85/255, 146/255)  # #5E5592 - Deep Cognitive Purple
    BRAND_YELLOW = colors.Color(248/255, 216/255, 48/255)  # #F8D830 - Behavioral Yellow
    
    # Secondary/Support Colors
    BRAND_LAVENDER = colors.Color(208/255, 198/255, 225/255)  # #D0C6E1 - Soft Purple
    BRAND_LIME = colors.Color(215/255, 223/255, 94/255)  # #D7DF5E - Research Lime
    SOFT_GRAY = colors.Color(244/255, 245/255, 247/255)  # #F4F5F7 - Soft Cognitive Gray
    
    # Base Colors
    TEXT_BLACK = colors.Color(3/255, 4/255, 3/255)  # #030403
    WHITE = colors.white
    
    # Opacity/Alpha variations
    PURPLE_LIGHT = colors.Color(94/255, 85/255, 146/255, alpha=0.1)
    YELLOW_LIGHT = colors.Color(248/255, 216/255, 48/255, alpha=0.2)

# ============================================================================
# TYPOGRAPHY - Font Definitions
# ============================================================================

class Typography:
    """Font families and sizes following Sparken brand guidelines"""
    
    # Font Families (Fallback to Helvetica since HOTHOUSE BOLD and AILERON not available)
    DISPLAY_FONT = "Helvetica-Bold"  # For headings (would be HOTHOUSE BOLD)
    BODY_FONT = "Helvetica"  # For body text (would be AILERON)
    
    # Font Sizes (in points)
    H1_SIZE = 24
    H2_SIZE = 18
    H3_SIZE = 14
    BODY_SIZE = 11
    SMALL_SIZE = 9
    COVER_TITLE_SIZE = 36
    COVER_SUBTITLE_SIZE = 18
    
    # Line Heights (as multipliers)
    H1_LEADING = 1.3
    H2_LEADING = 1.3
    H3_LEADING = 1.3
    BODY_LEADING = 1.6

# ============================================================================
# LAYOUT SPECIFICATIONS
# ============================================================================

class Layout:
    """Page layout and spacing specifications"""
    
    # Page Dimensions (Letter size: 8.5" x 11")
    PAGE_WIDTH = 612  # 8.5 inches in points
    PAGE_HEIGHT = 792  # 11 inches in points
    
    # Margins (Safety Limits)
    MARGIN_TOP = 72  # 1 inch
    MARGIN_BOTTOM = 72  # 1 inch
    MARGIN_LEFT = 72  # 1 inch
    MARGIN_RIGHT = 72  # 1 inch
    
    # Header/Footer
    HEADER_HEIGHT = 35  # Reduced from 80 to avoid covering document text
    FOOTER_HEIGHT = 50
    
    # Content Area
    CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
    CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - HEADER_HEIGHT - FOOTER_HEIGHT
    
    # Spacing
    SECTION_SPACING = 20
    PARAGRAPH_SPACING = 12
    LINE_SPACING = 6
    
    # Component Dimensions
    CALLOUT_BORDER_WIDTH = 4
    TABLE_ROW_HEIGHT = 30
    YELLOW_ACCENT_LINE_WIDTH = 2
    
    # Watermark
    WATERMARK_SIZE = 120
    WATERMARK_SPACING = 180
    WATERMARK_OPACITY = 0.04

# ============================================================================
# COMPONENT STYLES
# ============================================================================

class ComponentStyles:
    """Predefined styles for various PDF components"""
    
    @staticmethod
    def get_h1_style():
        """H1 heading style - All caps, purple, large"""
        return {
            'font': Typography.DISPLAY_FONT,
            'size': Typography.H1_SIZE,
            'color': BrandColors.BRAND_PURPLE,
            'uppercase': True,
            'leading': Typography.H1_SIZE * Typography.H1_LEADING
        }
    
    @staticmethod
    def get_h2_style():
        """H2 heading style - Title case, purple"""
        return {
            'font': Typography.DISPLAY_FONT,
            'size': Typography.H2_SIZE,
            'color': BrandColors.BRAND_PURPLE,
            'uppercase': False,
            'leading': Typography.H2_SIZE * Typography.H2_LEADING
        }
    
    @staticmethod
    def get_h3_style():
        """H3 heading style - Bold, purple or black"""
        return {
            'font': Typography.DISPLAY_FONT,
            'size': Typography.H3_SIZE,
            'color': BrandColors.BRAND_PURPLE,
            'uppercase': False,
            'leading': Typography.H3_SIZE * Typography.H3_LEADING
        }
    
    @staticmethod
    def get_body_style():
        """Body text style"""
        return {
            'font': Typography.BODY_FONT,
            'size': Typography.BODY_SIZE,
            'color': BrandColors.TEXT_BLACK,
            'leading': Typography.BODY_SIZE * Typography.BODY_LEADING
        }
    
    @staticmethod
    def get_table_header_style():
        """Table header row style"""
        return {
            'font': Typography.DISPLAY_FONT,
            'size': Typography.BODY_SIZE,
            'color': BrandColors.WHITE,
            'background': BrandColors.BRAND_PURPLE
        }
    
    @staticmethod
    def get_table_row_style(row_index):
        """Table body row style with striping"""
        return {
            'font': Typography.BODY_FONT,
            'size': Typography.BODY_SIZE,
            'color': BrandColors.TEXT_BLACK,
            'background': BrandColors.BRAND_LAVENDER if row_index % 2 == 1 else BrandColors.WHITE
        }

# ============================================================================
# DOCUMENT THEMES
# ============================================================================

class DocumentTheme:
    """Cover page themes based on document type"""
    
    FORMAL = {
        'background': BrandColors.BRAND_PURPLE,
        'title_color': BrandColors.WHITE,
        'subtitle_color': BrandColors.WHITE,
        'logo': 'sparken-logo-horizontal-white.png'  # White logo on purple
    }
    
    CREATIVE = {
        'background': BrandColors.BRAND_YELLOW,
        'title_color': BrandColors.BRAND_PURPLE,
        'subtitle_color': BrandColors.BRAND_PURPLE,
        'logo': 'sparken-logo-horizontal-white.png'  # White logo for consistency
    }
