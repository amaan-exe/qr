import { runComplianceSuite } from '../src/lib/compliance/verify'

async function main() {
  console.log('\n🔍 Running ReviewPulse Compliance Verification Suite (CG-1 to CG-10)...\n')
  const report = await runComplianceSuite()

  console.table(
    report.results.map((r) => ({
      Rule: r.ruleId,
      Title: r.title,
      Status: r.passed ? '✅ PASS' : '❌ FAIL',
      Details: r.details,
    }))
  )

  if (report.passed) {
    console.log('\n🎉 ALL 10 COMPLIANCE GUARDRAILS PASSED! (100% Policy-Compliant)\n')
    process.exit(0)
  } else {
    console.error('\n⚠️ COMPLIANCE CHECKS FAILED!\n')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error running compliance verification:', err)
  process.exit(1)
})
