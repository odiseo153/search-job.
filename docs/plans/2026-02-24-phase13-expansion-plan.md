# Phase 13: RSS Niche Board Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-24
**Status:** Complete
**Epic:** Source Expansion - Phase 13

---

## 1. Overview

Expand ever-jobs from **101+ sources** to **111+ sources** by adding 10 RSS-based niche job boards. All sources use public RSS feeds requiring no authentication, following the same XML parsing pattern as `source-weworkremotely`.

---

## 2. New Sources

### 2.1 CryptoJobsList (Crypto/Web3)

| Field | Value |
|-------|-------|
| **Package** | `source-cryptojobslist` |
| **Site Enum** | `CRYPTOJOBSLIST` |
| **API** | `GET https://api.cryptojobslist.com/jobs.rss` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Crypto, blockchain, Web3, DeFi jobs. Fields: title, description, link, dc:creator (company), pubDate |

### 2.2 Jobspresso (Remote Jobs)

| Field | Value |
|-------|-------|
| **Package** | `source-jobspresso` |
| **Site Enum** | `JOBSPRESSO` |
| **API** | `GET https://jobspresso.co/feed/?post_type=job_listing` |
| **Auth** | None |
| **Format** | RSS/XML (WordPress) |
| **Notes** | Curated remote jobs. 1,000+ listings. |

### 2.3 HigherEdJobs (Education)

| Field | Value |
|-------|-------|
| **Package** | `source-higheredjobs` |
| **Site Enum** | `HIGHEREDJOBS` |
| **API** | `GET https://www.higheredjobs.com/search/rss.cfm` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Higher education jobs (faculty, admin, research). Category feeds available. |

### 2.4 FOSS Jobs (Open Source)

| Field | Value |
|-------|-------|
| **Package** | `source-fossjobs` |
| **Site Enum** | `FOSSJOBS` |
| **API** | `GET https://www.fossjobs.net/rss/all/` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Free/open source software jobs. Tor Project, Wikimedia, etc. |

### 2.5 LaraJobs (Laravel/PHP)

| Field | Value |
|-------|-------|
| **Package** | `source-larajobs` |
| **Site Enum** | `LARAJOBS` |
| **API** | `GET https://larajobs.com/feed` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Official Laravel job board. PHP/Laravel roles. |

### 2.6 Python.org Jobs (Python)

| Field | Value |
|-------|-------|
| **Package** | `source-pythonjobs` |
| **Site Enum** | `PYTHONJOBS` |
| **API** | `GET https://www.python.org/jobs/feed/rss/` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Official PSF job board. Python-specific roles. |

### 2.7 Drupal Jobs (Drupal/CMS)

| Field | Value |
|-------|-------|
| **Package** | `source-drupaljobs` |
| **Site Enum** | `DRUPALJOBS` |
| **API** | `GET https://jobs.drupal.org/all-jobs/feed` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Official Drupal Association job board. |

### 2.8 Real Work From Anywhere (Remote)

| Field | Value |
|-------|-------|
| **Package** | `source-realworkfromanywhere` |
| **Site Enum** | `REALWORKFROMANYWHERE` |
| **API** | `GET https://www.realworkfromanywhere.com/rss.xml` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Remote jobs with 15+ category-specific feeds. |

### 2.9 Golang Projects (Go)

| Field | Value |
|-------|-------|
| **Package** | `source-golangjobs` |
| **Site Enum** | `GOLANGJOBS` |
| **API** | `GET https://www.golangprojects.com/rss.xml` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Go/Golang-specific job board. |

### 2.10 WordPress Jobs (WordPress)

| Field | Value |
|-------|-------|
| **Package** | `source-wordpressjobs` |
| **Site Enum** | `WORDPRESSJOBS` |
| **API** | `GET https://jobs.wordpress.net/feed/` |
| **Auth** | None |
| **Format** | RSS/XML |
| **Notes** | Official WordPress community job board. |

---

## 3. Success Criteria

- [x] All 10 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
