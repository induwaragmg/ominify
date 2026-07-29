"""
Strongly typed Pydantic schemas for ExecutionPlan, UserPreferences, and planning metadata.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    """Structured long-term user preferences preserved across conversation turns."""
    budget: Optional[str] = Field(default=None, description="Max budget or price range constraint")
    brand: Optional[str] = Field(default=None, description="Preferred brand name(s)")
    color: Optional[str] = Field(default=None, description="Preferred color")
    size: Optional[str] = Field(default=None, description="Size specification")
    material: Optional[str] = Field(default=None, description="Material preference")
    gender: Optional[str] = Field(default=None, description="Gender target (men, women, unisex, kids)")
    purpose: Optional[str] = Field(default=None, description="Primary usage purpose (running, formal, gaming)")
    negative_preferences: List[str] = Field(default_factory=list, description="Explicitly disliked attributes or brands")
    rejected_products: List[str] = Field(default_factory=list, description="Product IDs explicitly rejected by user")


class ExecutionPlan(BaseModel):
    """
    Strongly typed execution plan produced by PlanningNode and consumed by state machine nodes.
    Exposes confidence scores, dependency graphs, tool groups, and decision reasoning for explainability.
    """
    intent: str = Field(default="general_inquiry", description="Intent: search_products, compare_products, get_categories, general_inquiry")
    shopping_objective: str = Field(default="", description="High-level goal statement")
    extracted_preferences: Dict[str, Any] = Field(default_factory=dict, description="Structured preference mapping")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Planning confidence score (0.0 to 1.0)")
    required_tools: List[str] = Field(default_factory=list, description="Required tool names")
    execution_order: List[str] = Field(default_factory=list, description="Ordered step execution plan")
    parallel_groups: List[List[str]] = Field(default_factory=list, description="Independent tool groups for asyncio.gather")
    dependencies: Dict[str, List[str]] = Field(default_factory=dict, description="Map of tool name -> prerequisite tools")
    expected_outputs: List[str] = Field(default_factory=list, description="Expected node outputs")
    clarification_needed: bool = Field(default=False, description="True if confidence is low and prompt is ambiguous")
    clarification_question: Optional[str] = Field(default=None, description="Context-aware clarification question")
    reasoning: str = Field(default="", description="Explainable reasoning summary behind the plan")
