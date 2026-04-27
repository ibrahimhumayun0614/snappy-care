Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $root "styles.css"
$htmlFiles = Get-ChildItem -Path $root -Filter "*.html" -File

$trackedProperties = @(
    "color",
    "background-color",
    "font-size",
    "border",
    "border-width",
    "border-color"
)

$ctaClassPattern = "btn-primary|btn-secondary"
$contextClasses = @(
    "btn-sm",
    "submit-btn",
    "modal-submit",
    "apply-btn",
    "service-feature-card",
    "booking-steps-action",
    "services-page-header",
    "header",
    "nav"
)

function Get-BorderWidthFromValue {
    param([string] $Value)

    if ($Value -match "\b(\d+(?:\.\d+)?px)\b") {
        return $matches[1]
    }

    return $null
}

function Get-BorderColorFromValue {
    param([string] $Value)

    if ($Value -match "(var\([^)]+\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s*$") {
        return $matches[1]
    }

    return $null
}

function Get-CssDeclarations {
    param([string] $Block)

    $declarations = @{}

    foreach ($part in ($Block -split ";")) {
        if ($part -match "^\s*([a-zA-Z-]+)\s*:\s*(.+?)\s*$") {
            $property = $matches[1].ToLowerInvariant()
            $value = $matches[2] -replace "\s*!important", ""
            $value = $value.Trim()
            $declarations[$property] = $value
        }
    }

    return $declarations
}

function Get-CtaUsages {
    param(
        [System.IO.FileInfo] $File,
        [string[]] $Contexts
    )

    $content = Get-Content -LiteralPath $File.FullName -Raw
    $lines = Get-Content -LiteralPath $File.FullName
    $usages = @()
    $stack = New-Object System.Collections.ArrayList
    $voidTags = @("area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr")
    $tagMatches = [regex]::Matches($content, '<(?<closing>/)?(?<tag>[a-zA-Z0-9-]+)\b(?<attrs>[^>]*)>', "IgnoreCase")

    foreach ($match in $tagMatches) {
        $tag = $match.Groups["tag"].Value.ToLowerInvariant()
        $attrs = $match.Groups["attrs"].Value
        $isClosing = $match.Groups["closing"].Value -eq "/"
        $isSelfClosing = $attrs.TrimEnd().EndsWith("/")

        if ($isClosing) {
            for ($i = $stack.Count - 1; $i -ge 0; $i--) {
                if ($stack[$i].Tag -eq $tag) {
                    $stack.RemoveRange($i, $stack.Count - $i)
                    break
                }
            }
            continue
        }

        $classValue = ""
        if ($attrs -match 'class="([^"]*)"') {
            $classValue = $matches[1]
        }

        if (($tag -eq "a" -or $tag -eq "button") -and $classValue -match "\b(?:btn-primary|btn-secondary)\b") {
            $before = $content.Substring(0, $match.Index)
            $lineNumber = (($before -split "`n").Count)
            $snippet = ($lines[$lineNumber - 1]).Trim()
            $ownClasses = @($classValue -split "\s+" | Where-Object { $_ })
            $ancestorClasses = @()

            foreach ($entry in $stack) {
                $ancestorClasses += $entry.Classes
            }

            $foundContexts = @()
            foreach ($context in $Contexts) {
                if ($ownClasses -contains $context -or $ancestorClasses -contains $context) {
                    $foundContexts += $context
                }
            }

            $variant = if ($ownClasses -contains "btn-primary") { "btn-primary" } else { "btn-secondary" }

            $usages += [pscustomobject]@{
                Page = $File.Name
                Line = $lineNumber
                Variant = $variant
                Classes = $classValue
                Contexts = $foundContexts
                AllClasses = @($ownClasses + $ancestorClasses)
                Snippet = $snippet
            }
        }

        if (-not $isSelfClosing -and $voidTags -notcontains $tag) {
            [void] $stack.Add([pscustomobject]@{
                Tag = $tag
                Classes = @($classValue -split "\s+" | Where-Object { $_ })
            })
        }
    }

    return $usages
}

function Test-SelectorMatchesUsage {
    param(
        [string] $Selector,
        [object] $Usage
    )

    foreach ($rawSelector in ($Selector -split ",")) {
        $selectorPart = $rawSelector.Trim()

        if ($selectorPart -match "\.btn-primary\b" -and $Usage.Variant -ne "btn-primary") {
            continue
        }

        if ($selectorPart -match "\.btn-secondary\b" -and $Usage.Variant -ne "btn-secondary") {
            continue
        }

        $selectorClasses = @([regex]::Matches($selectorPart, "\.([a-zA-Z0-9_-]+)") | ForEach-Object { $_.Groups[1].Value })
        $selectorClasses = @($selectorClasses | Where-Object { $_ -ne $Usage.Variant })

        $allClasses = @($Usage.AllClasses)
        $allMatch = $true

        foreach ($selectorClass in $selectorClasses) {
            if ($allClasses -notcontains $selectorClass) {
                $allMatch = $false
                break
            }
        }

        if ($allMatch) {
            return $true
        }
    }

    return $false
}

$css = Get-Content -LiteralPath $cssPath -Raw
$cssWithoutComments = [regex]::Replace($css, "/\*.*?\*/", "", "Singleline")
$rules = [regex]::Matches($cssWithoutComments, "([^{}]+)\{([^{}]+)\}", "Singleline")
$ctaRules = @()
$ctaModifierClasses = @("btn-sm", "submit-btn", "modal-submit", "apply-btn")
$selectorPatterns = @($ctaClassPattern) + ($ctaModifierClasses | ForEach-Object { "\.$([regex]::Escape($_))\b" })

$ruleIndex = 0
foreach ($rule in $rules) {
    $ruleIndex++
    $selectorText = ($rule.Groups[1].Value -replace "\s+", " ").Trim()
    $block = $rule.Groups[2].Value

    $isCtaRelated = $false
    foreach ($pattern in $selectorPatterns) {
        if ($selectorText -match $pattern) {
            $isCtaRelated = $true
            break
        }
    }

    if (-not $isCtaRelated) {
        continue
    }

    if ($selectorText -match ":hover|:active|:focus|@media") {
        continue
    }

    $declarations = Get-CssDeclarations -Block $block
    $tracked = @{}

    foreach ($property in $trackedProperties) {
        if ($declarations.ContainsKey($property)) {
            $tracked[$property] = $declarations[$property]
        }
    }

    if ($tracked.Count -eq 0) {
        continue
    }

    $ctaRules += [pscustomobject]@{
        Order = $ruleIndex
        Selector = $selectorText
        Declarations = $tracked
    }
}

$baseRules = $ctaRules | Where-Object {
    $_.Selector -match "^\s*\.btn-primary\s*,\s*\.btn-secondary\s*$" -or
    $_.Selector -match "^\s*\.btn-primary\s*$" -or
    $_.Selector -match "^\s*\.btn-secondary\s*$"
}

$baseByVariant = @{
    "btn-primary" = @{}
    "btn-secondary" = @{}
}

foreach ($rule in $baseRules | Sort-Object Order) {
    $variants = @()

    if ($rule.Selector -match "\.btn-primary\b") {
        $variants += "btn-primary"
    }

    if ($rule.Selector -match "\.btn-secondary\b") {
        $variants += "btn-secondary"
    }

    foreach ($variant in $variants) {
        foreach ($entry in $rule.Declarations.GetEnumerator()) {
            $baseByVariant[$variant][$entry.Name] = $entry.Value

            if ($entry.Name -eq "border") {
                $width = Get-BorderWidthFromValue -Value $entry.Value
                $color = Get-BorderColorFromValue -Value $entry.Value

                if ($width) {
                    $baseByVariant[$variant]["border-width"] = $width
                }

                if ($color) {
                    $baseByVariant[$variant]["border-color"] = $color
                }
            }
        }
    }
}

$overrideRules = $ctaRules | Where-Object {
    $_.Selector -notmatch "^\s*\.btn-primary\s*,\s*\.btn-secondary\s*$" -and
    $_.Selector -notmatch "^\s*\.btn-primary\s*$" -and
    $_.Selector -notmatch "^\s*\.btn-secondary\s*$"
}

$allUsages = foreach ($file in $htmlFiles) {
    Get-CtaUsages -File $file -Contexts $contextClasses
}

$issues = @()
foreach ($usage in $allUsages) {
    foreach ($rule in $overrideRules) {
        if (Test-SelectorMatchesUsage -Selector $rule.Selector -Usage $usage) {
            $mismatches = @()

            foreach ($entry in $rule.Declarations.GetEnumerator()) {
                $property = $entry.Name
                $value = $entry.Value

                if ($property -eq "border") {
                    $width = Get-BorderWidthFromValue -Value $value
                    $color = Get-BorderColorFromValue -Value $value

                    if ($width -and $baseByVariant[$usage.Variant].ContainsKey("border-width") -and $width -ne $baseByVariant[$usage.Variant]["border-width"]) {
                        $mismatches += "border-width: $width (base $($baseByVariant[$usage.Variant]["border-width"]))"
                    }

                    if ($color -and $baseByVariant[$usage.Variant].ContainsKey("border-color") -and $color -ne $baseByVariant[$usage.Variant]["border-color"]) {
                        $mismatches += "border-color: $color (base $($baseByVariant[$usage.Variant]["border-color"]))"
                    }

                    continue
                }

                if (-not $baseByVariant[$usage.Variant].ContainsKey($property)) {
                    continue
                }

                if ($value -ne $baseByVariant[$usage.Variant][$property]) {
                    $mismatches += "$property`: $value (base $($baseByVariant[$usage.Variant][$property]))"
                }
            }

            if ($mismatches.Count -eq 0) {
                continue
            }

            $issues += [pscustomobject]@{
                Page = $usage.Page
                Line = $usage.Line
                Variant = $usage.Variant
                Classes = $usage.Classes
                Context = ($usage.Contexts -join ", ")
                Selector = $rule.Selector
                Properties = ($mismatches -join "; ")
            }
        }
    }
}

Write-Host "CTA style consistency test"
Write-Host "Checked $($htmlFiles.Count) HTML pages and $($allUsages.Count) CTA elements."
Write-Host ""
Write-Host "Base CTA declarations found:"
foreach ($rule in $baseRules) {
    $props = (($rule.Declarations.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name): $($_.Value)" }) -join "; ")
    Write-Host "  $($rule.Selector) -> $props"
}

Write-Host ""
if ($issues.Count -eq 0) {
    Write-Host "PASS: No CTA color, font-size, or border overrides were found."
    exit 0
}

Write-Host "FAIL: CTA style overrides found on these pages:"
$issues |
    Sort-Object Page, Line, Selector -Unique |
    Format-List Page, Line, Variant, Classes, Selector, Properties

exit 1
