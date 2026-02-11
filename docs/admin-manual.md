# Admin Manual - CauseWay Financial Consulting

This document is the comprehensive administration guide for the CauseWay Financial Consulting platform admin panel. It covers every feature available to administrators and editors, including content management, bilingual workflows, SEO configuration, and system monitoring.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Resources](#managing-resources)
4. [Managing Categories](#managing-categories)
5. [Managing Pages](#managing-pages)
6. [Health Dashboard](#health-dashboard)
7. [Audit Log](#audit-log)
8. [File Uploads](#file-uploads)
9. [SEO](#seo)
10. [Bilingual Content](#bilingual-content)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

The admin panel is available at the following URL:

```
https://your-domain.com/admin/login
```

Navigate to `/admin/login` in your browser to reach the login screen.

### Default Credentials

The platform is provisioned with the following default administrator account:

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@causewaygrp.com    |
| Password | admin123                 |

**IMPORTANT: You must change the default password immediately after your first login.** Leaving default credentials in place is a critical security risk. Navigate to your profile settings after login and set a strong, unique password.

### User Roles

The admin panel supports two roles with distinct permission levels:

| Role   | Access Level                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------|
| Admin  | Full access to all features, including user management, system settings, audit logs, and all content operations. |
| Editor | Content management only. Can create, edit, publish, and unpublish resources, categories, and pages. No access to system settings, user management, or audit logs. |

Admins can create and manage Editor accounts from the user management section. Always follow the principle of least privilege: assign the Editor role unless the user genuinely requires full administrative access.

### First-Time Setup Checklist

1. Log in with the default credentials.
2. Change the default password immediately.
3. Create individual accounts for each administrator and editor (do not share credentials).
4. Review and configure system settings (file upload limits, S3 storage, etc.).
5. Set up initial categories before creating resources.
6. Verify bilingual content workflows by creating a test resource in both English and Arabic.

---

## Dashboard

The dashboard is the landing page after login and provides a high-level overview of the platform's content and health.

### Overview of Content Stats

The top section of the dashboard displays summary statistics:

- **Total Resources** - The count of all resources (published and draft).
- **Published Resources** - The count of resources currently visible on the public site.
- **Total Pages** - The count of all custom pages.
- **Total Categories** - The count of active categories.
- **Total Files** - The count of uploaded files across all resources.

### Bilingual Coverage Indicators

A key feature of the dashboard is the bilingual coverage display, which shows the percentage of resources and pages that have both English and Arabic content completed:

- **Resource Bilingual Coverage** - The percentage of resources where both the English and Arabic fields (title, description, content) are filled in.
- **Page Bilingual Coverage** - The percentage of pages where both language tabs have complete content.

These indicators are displayed as progress bars with color coding:
- Green (90-100%): Excellent coverage.
- Yellow (70-89%): Needs attention.
- Red (below 70%): Significant gaps in bilingual content.

The goal is to maintain 100% bilingual coverage for all published content.

### Recent Activity Feed

The dashboard includes a chronological feed of the most recent actions taken in the admin panel:

- Resource created, updated, published, or unpublished.
- Category created, modified, or deleted.
- Page created, edited, or published.
- File uploaded or removed.

Each entry shows the timestamp, the user who performed the action, and a brief description.

### Quick Action Buttons

For convenience, the dashboard provides quick action buttons:

- **New Resource** - Navigates directly to the resource creation form.
- **New Page** - Navigates directly to the page creation form.
- **New Category** - Opens the category creation form.
- **View Site** - Opens the public-facing website in a new tab.
- **Run Health Check** - Triggers a health check scan (see [Health Dashboard](#health-dashboard)).

---

## Managing Resources

Resources are the primary content type on the platform, encompassing reports, whitepapers, articles, and other publications.

### Creating a New Resource

1. Navigate to **Resources** in the sidebar menu.
2. Click the **New Resource** button.
3. The resource editor opens with two language tabs: **EN** (English) and **AR** (Arabic).

### Filling in Content for Both Languages

Each language tab contains the following fields:

| Field       | Description                                                                 | Required |
|-------------|-----------------------------------------------------------------------------|----------|
| Title       | The resource title displayed on the public site.                            | Yes      |
| Description | A short summary (1-3 sentences) used in listings and previews.              | Yes      |
| Content     | The full body content of the resource. Supports rich text editing.          | Yes      |

**Workflow:**
1. Fill in the English fields first under the **EN** tab.
2. Switch to the **AR** tab and fill in the Arabic translations for title, description, and content.
3. The Arabic tab provides a right-to-left (RTL) text input environment.

### Setting the Resource Type

Choose one of the following types from the dropdown:

- **Report** - Formal research reports and analysis documents.
- **Whitepaper** - In-depth whitepapers on specific financial topics.
- **Article** - Shorter editorial or news-style content.
- **Guide** - How-to guides and instructional content.
- **Case Study** - Client case studies and success stories.
- **Infographic** - Visual data presentations.
- **Presentation** - Slide decks and presentation materials.

The resource type determines how the content is categorized and filtered on the public site.

### Assigning a Category

Select a category from the dropdown list. Categories must be created beforehand (see [Managing Categories](#managing-categories)). Each resource must belong to exactly one category.

### Adding Tags

Tags provide additional classification and enable cross-cutting search and filtering:

1. Type a tag name in the tags input field.
2. Press Enter or click the add button to add the tag.
3. Existing tags will appear as autocomplete suggestions.
4. Add multiple tags as needed.
5. Remove a tag by clicking the X icon next to it.

Tags are shared across all resources and are language-independent.

### Upload File or Set External URL

Resources can have an associated file or external link:

- **Upload File** - Click the upload area to select a file from your computer, or drag and drop a file onto the upload zone. See [File Uploads](#file-uploads) for supported formats and size limits.
- **External URL** - If the resource is hosted externally, enter the full URL in the external URL field instead of uploading a file.

You may provide either a file upload or an external URL, but not both.

### SEO Fields

Each language tab includes dedicated SEO fields:

| Field            | Description                                             | Character Limit |
|------------------|---------------------------------------------------------|-----------------|
| Meta Title       | The title used in search engine results and browser tabs. | 60 characters   |
| Meta Description | The description snippet shown in search engine results.  | 160 characters  |

Fill in SEO fields for both the English and Arabic tabs. Character counters are displayed next to each field to help you stay within limits.

### Publishing Workflow

Resources follow a two-state publishing workflow:

```
Draft  -->  Published
  ^            |
  |            v
  +--- Unpublished
```

- **Draft** - The initial state when a resource is created. Drafts are not visible on the public site.
- **Publish** - Click the **Publish** button to make the resource live on the public site.
- **Unpublish** - Click **Unpublish** on a published resource to revert it to draft state. The resource is immediately removed from the public site.

The publish/unpublish actions are recorded in the [Audit Log](#audit-log).

### Featured Resources

To feature a resource on the homepage or prominent listing positions:

1. Open the resource in the editor.
2. Click the star toggle icon to mark it as featured.
3. Featured resources appear with a star icon in the resource list.
4. On the public site, featured resources are displayed prominently in designated sections.

Toggle the star off to remove the featured status.

### Priority Ordering

Control the display order of resources within their category:

1. In the resource list, use the priority field or drag-and-drop handles to set the order.
2. Lower priority numbers appear first (priority 1 is displayed before priority 2).
3. Resources with the same priority are sorted by publication date (newest first).

### Completion Indicator

The resource list displays a completion indicator for each resource, showing the percentage of bilingual fields that are filled:

- **100%** - All English and Arabic fields are complete (title, description, content, meta title, meta description for both languages).
- **50%** - Only one language is complete.
- **Partial percentages** - Some fields are filled in both languages but not all.

Use this indicator to identify resources that need Arabic translations or are missing SEO fields.

---

## Managing Categories

Categories provide the primary organizational structure for resources.

### Creating Categories

1. Navigate to **Categories** in the sidebar menu.
2. Click **New Category**.
3. Fill in the following fields:

| Field         | Description                                        | Required |
|---------------|----------------------------------------------------|----------|
| English Name  | The category name displayed on the English site.   | Yes      |
| Arabic Name   | The category name displayed on the Arabic site.    | Yes      |
| Color         | A hex color code used for visual identification.   | No       |

4. Click **Save** to create the category.

### Color Coding

Each category can be assigned a color that is used throughout the admin panel and public site for visual identification:

- Click the color picker or enter a hex color code (e.g., `#2563EB`).
- The color is displayed as a badge in category listings, resource cards, and filter controls.
- Choose colors that are visually distinct from one another for easy identification.

### Reordering Categories

Categories are displayed in a specific order on the public site. To change the order:

1. In the category list, use the **up arrow** and **down arrow** buttons next to each category.
2. Click the up arrow to move a category higher in the list.
3. Click the down arrow to move a category lower in the list.
4. The order is saved automatically after each change.

The display order affects navigation menus, filter dropdowns, and category listing pages on the public site.

### Enable/Disable Categories

Categories can be toggled between enabled and disabled states:

- **Enabled** - The category is active and visible on the public site. Resources can be assigned to it.
- **Disabled** - The category is hidden from the public site. Existing resources in the category remain in the database but are not displayed publicly.

Toggle the enable/disable switch in the category list to change the state.

### Deleting Categories

To delete a category:

1. Ensure no resources are currently assigned to the category. The system will prevent deletion if resources are still assigned.
2. If resources exist in the category, reassign them to another category first by editing each resource and changing its category.
3. Once the category is empty, click the **Delete** button.
4. Confirm the deletion in the confirmation dialog.

**Note:** Category deletion is permanent and cannot be undone. The action is recorded in the audit log.

---

## Managing Pages

The pages feature allows administrators to create custom pages without writing code.

### Creating a New Page

1. Navigate to **Pages** in the sidebar menu.
2. Click **New Page**.
3. The page editor opens with configuration options and content editing areas.

### Setting the URL Slug

The URL slug determines the page's address on the public site:

- Enter a URL-friendly slug (lowercase letters, numbers, and hyphens only).
- Example: `about-us` results in the URL `https://your-domain.com/about-us`.
- Slugs must be unique across all pages.
- Avoid changing slugs after publication, as this will break existing links. If you must change a slug, set up a redirect.

### Template Selection

Choose a layout template for the page:

| Template   | Description                                                                          |
|------------|--------------------------------------------------------------------------------------|
| Default    | Standard page layout with header, content area, and footer.                          |
| Full-Width | Content spans the full width of the viewport with no side margins.                   |
| Sidebar    | Content area with a sidebar for navigation, related links, or supplementary content. |
| Landing    | Optimized for marketing and campaign landing pages with full-bleed hero sections.    |

Select the template that best suits the page's purpose. The template can be changed at any time.

### Structured Blocks Builder

Pages are built using a block-based content system. Add, remove, and reorder blocks to construct the page layout:

| Block Type | Description                                                                                   |
|------------|-----------------------------------------------------------------------------------------------|
| Hero       | A large banner section with headline, subheadline, background image, and call-to-action button. |
| Text       | A rich text content block for paragraphs, headings, lists, and inline media.                  |
| Cards      | A grid of cards, each with an image, title, description, and optional link.                   |
| CTA        | A call-to-action section with headline, description, and button.                              |
| Stats      | A row of statistic counters with labels (e.g., "500+ Clients", "20 Years Experience").        |
| Image      | A standalone image block with optional caption and alt text.                                  |
| FAQ        | An accordion-style frequently asked questions section with expandable question/answer pairs.   |

**To add a block:**
1. Click the **Add Block** button at the bottom of the blocks list.
2. Select the block type from the dropdown.
3. Fill in the block's fields.
4. Drag and drop blocks to reorder them.
5. Click the delete icon on a block to remove it.

### EN + AR Content Tabs

Like resources, pages support bilingual content:

1. Each block has **EN** and **AR** tabs.
2. Fill in the English content first, then switch to the Arabic tab for the translation.
3. The Arabic tab uses RTL text input.
4. All text fields within blocks (headlines, descriptions, button labels, FAQ questions and answers) should be translated.

### Show in Navigation Toggle

Control whether the page appears in the site's main navigation menu:

- **Enabled** - The page is listed in the navigation menu.
- **Disabled** - The page is accessible via its URL but does not appear in the navigation.

This is useful for landing pages or utility pages that should not clutter the main navigation.

### SEO Fields per Language

Each page has SEO fields for both English and Arabic:

| Field            | Description                                             | Character Limit |
|------------------|---------------------------------------------------------|-----------------|
| Meta Title       | The title used in search engine results and browser tabs. | 60 characters   |
| Meta Description | The description snippet shown in search engine results.  | 160 characters  |

Fill in both language tabs to ensure the page is properly indexed in both English and Arabic search results.

### Publishing Workflow

Pages follow the same publishing workflow as resources:

- **Draft** - Not visible on the public site.
- **Publish** - Makes the page live and accessible at its URL.
- **Unpublish** - Reverts the page to draft state and removes it from the public site.

---

## Health Dashboard

The health dashboard provides a centralized view of the platform's operational status and content quality.

### System Status Cards

The top section displays four status cards:

| Card             | Description                                                                                 |
|------------------|---------------------------------------------------------------------------------------------|
| Database         | Shows the database connection status and basic metrics (total records, response time).       |
| Storage          | Shows the S3 storage connection status and usage (total files, storage consumed).            |
| Broken Links     | Shows the count of detected broken links across published resources and pages.               |
| Translations     | Shows the count of published content items missing Arabic translations.                      |

Each card displays a status indicator:
- **Green** - Healthy, no issues detected.
- **Yellow** - Warning, some issues need attention.
- **Red** - Critical, immediate action required.

### Content Summary

Below the status cards, a content summary section shows:

- Total published resources by type.
- Total published pages.
- Total active categories.
- Total uploaded files and storage usage.

### Quality Checks

The health dashboard runs automated quality checks:

#### Arabic Translation Coverage

- Scans all published resources and pages.
- Identifies items where Arabic fields (title, description, content) are empty or incomplete.
- Displays a list of items needing Arabic translation with direct links to their editors.
- Shows the overall coverage percentage.

#### Broken Links

- Scans all published resources and pages for links (both internal and external).
- Tests each link for accessibility (HTTP status codes).
- Reports broken links (404, 500, timeout) with the source resource/page and the broken URL.
- Distinguishes between internal broken links (within the site) and external broken links (third-party URLs).

### Run Link Check Button

The broken link scan does not run continuously. To initiate a scan:

1. Click the **Run Link Check** button.
2. The scan runs in the background and may take several minutes depending on the volume of content.
3. Results are displayed when the scan completes.
4. The timestamp of the last scan is shown for reference.

### Monitoring Missing Translations

The health dashboard maintains a persistent list of published content items that are missing Arabic translations. This list updates automatically whenever content is published or modified. Use this list as a to-do tracker for your translation workflow:

1. Review the list of items missing Arabic content.
2. Click the edit link next to each item to open the editor.
3. Add the Arabic translations.
4. Save the resource or page.
5. The item is automatically removed from the missing translations list once all Arabic fields are filled.

---

## Audit Log

The audit log provides a complete, immutable record of all administrative actions taken on the platform.

### Accessing the Audit Log

Navigate to **Audit Log** in the sidebar menu (Admin role only; Editors do not have access).

### Filtering

Filter the audit log by entity type to narrow down results:

- **Resources** - Actions related to resources (create, update, delete, publish, unpublish).
- **Categories** - Actions related to categories (create, update, delete, reorder).
- **Pages** - Actions related to pages (create, update, delete, publish, unpublish).
- **Files** - Actions related to file uploads and deletions.

Additional filter options:
- **Date range** - Filter by start and end date.
- **User** - Filter by the user who performed the action.
- **Action type** - Filter by specific action (see below).

### Log Entry Fields

Each audit log entry contains the following information:

| Field     | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Timestamp | The exact date and time the action occurred (in UTC).               |
| User      | The email address or name of the user who performed the action.     |
| Action    | The type of action performed (see action types below).              |
| Entity    | The type and identifier of the affected item (e.g., "Resource #42"). |
| Details   | Additional context about the action (e.g., fields changed, previous values). |

### Action Types

The following action types are recorded:

| Action    | Description                                                       |
|-----------|-------------------------------------------------------------------|
| CREATE    | A new resource, category, page, or other entity was created.      |
| UPDATE    | An existing entity was modified. Details show which fields changed.|
| DELETE    | An entity was permanently deleted.                                |
| PUBLISH   | A resource or page was published (made visible on the public site).|
| UNPUBLISH | A resource or page was unpublished (removed from the public site). |
| UPLOAD    | A file was uploaded to the platform.                              |

### Using the Audit Log

The audit log is valuable for:

- **Accountability** - Tracking who made specific changes and when.
- **Debugging** - Understanding when and how content was modified if issues arise.
- **Compliance** - Maintaining a record of all content changes for regulatory purposes.
- **Rollback decisions** - Reviewing what changed before deciding to revert content.

---

## File Uploads

The platform supports file uploads for resources and page content.

### Supported Formats

The following file formats are accepted:

| Category    | Formats                |
|-------------|------------------------|
| Documents   | PDF, DOCX, XLSX, PPTX  |
| Images      | JPEG, PNG, WebP, SVG   |

### Maximum File Size

- The default maximum file size is **15 MB** per file.
- This limit is configurable by administrators in the system settings.
- If a file exceeds the limit, the upload is rejected with an error message indicating the maximum allowed size.

### Storage Architecture

Uploaded files are stored on Amazon S3 with an organized directory structure:

```
{folder}/{year}/{month}/{filename}
```

For example:
```
resources/2026/02/annual-report-2025.pdf
pages/2026/01/hero-background.webp
```

This structure ensures:
- Files are logically organized by type and upload date.
- Name collisions are avoided through unique path generation.
- Files can be easily located and managed in the S3 bucket.

### Secure URLs

All file URLs are served securely:

- Files are accessed through signed URLs or a CDN with appropriate access controls.
- Direct S3 bucket access is not exposed to end users.
- URLs are served over HTTPS.

### Managing Uploaded Files

- When a file is uploaded to a resource, it replaces any previously uploaded file for that resource.
- Deleting a resource does not automatically delete its uploaded file. Orphaned files are cleaned up during periodic maintenance.
- File upload and deletion actions are recorded in the [Audit Log](#audit-log).

---

## SEO

Search engine optimization is built into the platform at the content level.

### Meta Fields per Content Item

Every resource and page has dedicated SEO fields for both English and Arabic:

| Field            | Character Limit | Purpose                                              |
|------------------|-----------------|------------------------------------------------------|
| Meta Title       | 60 characters   | Displayed in browser tabs and search engine results.  |
| Meta Description | 160 characters  | Shown as the description snippet in search results.   |

**Best Practices:**
- Keep meta titles concise and descriptive. Include the primary keyword near the beginning.
- Write meta descriptions that accurately summarize the content and encourage clicks.
- Do not duplicate meta titles or descriptions across different resources or pages.
- Fill in both English and Arabic meta fields for every published item.

### hreflang Tags

The platform automatically generates `hreflang` tags for all published content:

```html
<link rel="alternate" hreflang="en" href="https://your-domain.com/resources/report-slug" />
<link rel="alternate" hreflang="ar" href="https://your-domain.com/ar/resources/report-slug" />
```

These tags tell search engines about the language-specific versions of each page, ensuring:
- English-speaking users are directed to the English version.
- Arabic-speaking users are directed to the Arabic version.
- Search engines do not treat the two versions as duplicate content.

No manual configuration is needed; hreflang tags are generated automatically based on the available translations.

### Sitemap

The platform generates an XML sitemap automatically:

- **URL:** `https://your-domain.com/sitemap.xml`
- The sitemap includes all published resources and pages in both languages.
- It is updated automatically whenever content is published or unpublished.
- Submit the sitemap URL to Google Search Console and Bing Webmaster Tools for optimal indexing.

### robots.txt

The `robots.txt` file is configured to:

- **Block** `/admin/` - Prevents search engines from indexing admin panel pages.
- **Block** `/api/` - Prevents search engines from indexing API endpoints.
- **Allow** all other public-facing URLs.

The `robots.txt` file is located at `https://your-domain.com/robots.txt` and is generated automatically.

---

## Bilingual Content

The CauseWay Financial Consulting platform is fully bilingual, supporting English and Arabic. Maintaining complete bilingual content is a core requirement.

### Content Entry Workflow

1. **Always fill both English AND Arabic fields** for every resource and page.
2. Start with the **EN** tab and complete all English fields.
3. Switch to the **AR** tab and provide the Arabic translations for all fields.
4. Do not publish content until both language versions are complete.

### Arabic Tab and RTL Input

The Arabic content tab provides a right-to-left (RTL) text input environment:

- Text fields automatically align to the right.
- The rich text editor switches to RTL mode.
- Paragraph direction is set to RTL.
- Mixed content (Arabic text with English terms or numbers) is handled automatically through Unicode bidirectional algorithm support.

**Tips for Arabic content entry:**
- Use a keyboard with Arabic layout or an on-screen keyboard.
- Ensure proper Arabic grammar and formatting (Arabic-speaking content editors or professional translators are recommended).
- Test the Arabic content on the public site to verify correct display and layout.

### Dashboard Bilingual Coverage Percentage

The admin dashboard displays the overall bilingual coverage percentage:

- This metric represents the proportion of published content items where all required fields are filled in both English and Arabic.
- Fields included in the calculation: title, description, content, meta title, meta description.
- The percentage is calculated separately for resources and pages.

**Target: 100% bilingual coverage for all published content.**

### Health Dashboard Translation Flags

The [Health Dashboard](#health-dashboard) provides detailed information about missing translations:

- A list of all published resources and pages missing Arabic content.
- Direct edit links for quick access to incomplete items.
- The count of items needing translation attention.

### Best Practices for Bilingual Content

- Establish a workflow where English content is created first, then immediately queued for Arabic translation.
- Assign dedicated Arabic content editors or translators.
- Use the completion indicator in the resource list to identify items needing translation.
- Review the health dashboard weekly to catch any gaps.
- Do not publish content with only one language completed unless there is a compelling time-sensitive reason (and flag it for immediate translation follow-up).

---

## Troubleshooting

### Common Issues

**Cannot log in to the admin panel:**
- Verify you are using the correct URL (`/admin/login`).
- Check that your email and password are correct (passwords are case-sensitive).
- If you have forgotten your password, contact another administrator to reset it.
- Clear your browser cache and cookies if you experience session issues.

**File upload fails:**
- Check that the file format is supported (PDF, DOCX, XLSX, PPTX, JPEG, PNG, WebP, SVG).
- Verify the file size is under the configured limit (default 15 MB).
- Ensure the S3 storage connection is healthy (check the [Health Dashboard](#health-dashboard)).

**Content not appearing on the public site:**
- Confirm the resource or page is in **Published** state (not Draft).
- Check that the category (for resources) is enabled.
- Verify the page slug is correct and there are no URL conflicts.
- Clear the site cache if applicable.

**Arabic content not displaying correctly:**
- Ensure the Arabic fields are filled in (not just the English fields).
- Verify the text was entered in the **AR** tab, not the EN tab.
- Check for encoding issues (the platform uses UTF-8).
- Test in multiple browsers to rule out browser-specific rendering issues.

**Broken links reported in health dashboard:**
- Click each broken link entry to identify the source content and the broken URL.
- Edit the resource or page and correct or remove the broken link.
- For external links, verify the third-party URL is still active.
- Re-run the link check after corrections to confirm resolution.

**Audit log shows unexpected changes:**
- Review the timestamp and user fields to identify who made the change.
- Check if another administrator or editor made the modification.
- If unauthorized changes are detected, change the affected user's password immediately and review access controls.

---

## Support

For technical support or questions not covered in this manual, contact the CauseWay Financial Consulting development team or your designated system administrator.
